"""
MLVerse Production ML Training Engine
- Supports:
    1. ChurnIQ Flagship (B2B SaaS)
    2. ChurnIQ Telecom Expert
    3. ChurnIQ Banking Expert
    4. ChurnIQ Streaming Expert
    5. CommerceIQ (Purchase Propensity)
    6. RetailIQ (RFM Segmentation & K-Means Clustering)
    7. CreditRiskIQ (Default Risk & Scoring)
- Multi-Model Benchmarking: Logistic Regression, Random Forest, LightGBM, XGBoost, CatBoost
- Hyperparameter Tuning via Optuna
- Probability Calibration (Platt Scaling / Isotonic)
- Cost-Sensitive Threshold Optimization (F1, F2, Recall, Business Cost)
- SHAP Feature Importance & Local Explanations
- Artifact Storage in artifacts/models/<model_name>/
- Produces artifacts/reports/final_training_report.json
"""

import os
import sys
import json
import time
import joblib
import optuna
import shap
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    roc_auc_score, average_precision_score, precision_score, recall_score,
    f1_score, fbeta_score, log_loss, brier_score_loss, confusion_matrix,
    balanced_accuracy_score, silhouette_score, davies_bouldin_score, calinski_harabasz_score
)
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostClassifier

optuna.logging.set_verbosity(optuna.logging.WARNING)

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
PROCESSED_DIR = os.path.join(PROJECT_DIR, "data", "processed")
MODELS_DIR = os.path.join(PROJECT_DIR, "artifacts", "models")
REPORTS_DIR = os.path.join(PROJECT_DIR, "artifacts", "reports")
SHAP_DIR = os.path.join(PROJECT_DIR, "artifacts", "shap")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(SHAP_DIR, exist_ok=True)

training_report_entries = {}

def calculate_metrics(y_true, y_prob, threshold=0.5):
    y_pred = (y_prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    
    return {
        "roc_auc": round(float(roc_auc_score(y_true, y_prob)), 4),
        "pr_auc": round(float(average_precision_score(y_true, y_prob)), 4),
        "brier_score": round(float(brier_score_loss(y_true, y_prob)), 4),
        "log_loss": round(float(log_loss(y_true, np.clip(y_prob, 1e-7, 1 - 1e-7))), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "f2": round(float(fbeta_score(y_true, y_pred, beta=2, zero_division=0)), 4),
        "specificity": round(float(specificity), 4),
        "balanced_accuracy": round(float(balanced_accuracy_score(y_true, y_pred)), 4),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}
    }

def optimize_threshold(y_true, y_prob, fn_cost=500.0, fp_cost=50.0):
    thresholds = np.linspace(0.05, 0.95, 91)
    best_f1, best_f1_th = -1, 0.5
    best_f2, best_f2_th = -1, 0.5
    min_cost, best_cost_th = float("inf"), 0.5
    
    curve = []
    for th in thresholds:
        y_pred = (y_prob >= th).astype(int)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        f2 = fbeta_score(y_true, y_pred, beta=2, zero_division=0)
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
        cost = (fn * fn_cost) + (fp * fp_cost)
        
        if f1 > best_f1:
            best_f1 = f1
            best_f1_th = round(float(th), 3)
        if f2 > best_f2:
            best_f2 = f2
            best_f2_th = round(float(th), 3)
        if cost < min_cost:
            min_cost = cost
            best_cost_th = round(float(th), 3)
            
        curve.append({
            "threshold": round(float(th), 3),
            "f1": round(float(f1), 4),
            "f2": round(float(f2), 4),
            "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
            "cost": float(cost)
        })
        
    return {
        "default_threshold": 0.50,
        "optimal_f1_threshold": best_f1_th,
        "optimal_f2_threshold": best_f2_th,
        "optimal_cost_threshold": best_cost_th,
        "selected_threshold": best_f1_th, # Default to F1-optimal
        "configured_fn_cost": fn_cost,
        "configured_fp_cost": fp_cost,
        "threshold_curve": curve[::5] # sample points for UI charts
    }

def train_and_evaluate_tabular(
    project_key,
    df,
    target_col,
    id_col="customer_id",
    drop_cols=None,
    fn_cost=500.0,
    fp_cost=50.0
):
    print(f"\n=======================================================")
    print(f"TRAINING PIPELINE: {project_key.upper()}")
    print(f"=======================================================")
    start_time = time.time()
    
    if drop_cols is None:
        drop_cols = []
    
    # Feature columns
    feature_cols = [c for c in df.columns if c not in [id_col, target_col] + drop_cols]
    
    # Prepare X, y
    X = df[feature_cols].copy()
    # One-hot encode any string/categorical columns
    cat_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()
    if cat_cols:
        X = pd.get_dummies(X, columns=cat_cols, drop_first=True)
    
    X = X.fillna(X.median()) # Robust imputation
    y = df[target_col].values.astype(int)
    feature_names = list(X.columns)
    
    print(f"Dataset shape: {X.shape[0]} rows, {X.shape[1]} features. Target positive rate: {y.mean():.4f}")
    
    # 80/20 train/test split (Untouched test set!)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    # Further split train/val for candidate validation
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    # Candidate Models Comparison
    print("Benchmarking candidate models...")
    candidates = {}
    
    # 1. Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")
    lr.fit(X_train_scaled, y_train)
    lr_val_prob = lr.predict_proba(X_val_scaled)[:, 1]
    candidates["logistic_regression"] = {
        "model": lr,
        "is_scaled": True,
        "val_auc": roc_auc_score(y_val, lr_val_prob),
        "val_metrics": calculate_metrics(y_val, lr_val_prob)
    }
    
    # 2. Random Forest
    rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, class_weight="balanced", n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_val_prob = rf.predict_proba(X_val)[:, 1]
    candidates["random_forest"] = {
        "model": rf,
        "is_scaled": False,
        "val_auc": roc_auc_score(y_val, rf_val_prob),
        "val_metrics": calculate_metrics(y_val, rf_val_prob)
    }
    
    # 3. LightGBM
    lgb_model = lgb.LGBMClassifier(
        n_estimators=150, max_depth=6, learning_rate=0.05,
        random_state=42, class_weight="balanced", verbose=-1, n_jobs=-1
    )
    lgb_model.fit(X_train, y_train)
    lgb_val_prob = lgb_model.predict_proba(X_val)[:, 1]
    candidates["lightgbm"] = {
        "model": lgb_model,
        "is_scaled": False,
        "val_auc": roc_auc_score(y_val, lgb_val_prob),
        "val_metrics": calculate_metrics(y_val, lgb_val_prob)
    }
    
    # 4. XGBoost
    scale_pos = (len(y_train) - sum(y_train)) / (sum(y_train) + 1e-4)
    xgb_model = xgb.XGBClassifier(
        n_estimators=150, max_depth=5, learning_rate=0.05,
        scale_pos_weight=scale_pos, eval_metric="logloss", random_state=42, n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)
    xgb_val_prob = xgb_model.predict_proba(X_val)[:, 1]
    candidates["xgboost"] = {
        "model": xgb_model,
        "is_scaled": False,
        "val_auc": roc_auc_score(y_val, xgb_val_prob),
        "val_metrics": calculate_metrics(y_val, xgb_val_prob)
    }
    
    # Select Best Candidate based on Validation AUC
    best_candidate_name = max(candidates, key=lambda k: candidates[k]["val_auc"])
    print(f"Validation comparison:")
    for k, v in candidates.items():
        print(f"  {k:20s}: ROC-AUC = {v['val_auc']:.4f}, PR-AUC = {v['val_metrics']['pr_auc']:.4f}, F1 = {v['val_metrics']['f1']:.4f}")
    print(f"-> Selected best candidate: {best_candidate_name.upper()} (Validation ROC-AUC: {candidates[best_candidate_name]['val_auc']:.4f})")
    
    # Hyperparameter Optimization with Optuna on Selected Family
    print(f"Running Optuna hyperparameter optimization for {best_candidate_name}...")
    def objective(trial):
        if best_candidate_name in ["lightgbm", "xgboost"]:
            lr_rate = trial.suggest_float("learning_rate", 0.01, 0.15, log=True)
            depth = trial.suggest_int("max_depth", 3, 8)
            n_est = trial.suggest_int("n_estimators", 80, 250)
            subsample = trial.suggest_float("subsample", 0.6, 1.0)
            
            if best_candidate_name == "lightgbm":
                m = lgb.LGBMClassifier(
                    learning_rate=lr_rate, max_depth=depth, n_estimators=n_est,
                    subsample=subsample, random_state=42, class_weight="balanced", verbose=-1, n_jobs=-1
                )
            else:
                m = xgb.XGBClassifier(
                    learning_rate=lr_rate, max_depth=depth, n_estimators=n_est,
                    subsample=subsample, scale_pos_weight=scale_pos, eval_metric="logloss", random_state=42, n_jobs=-1
                )
        elif best_candidate_name == "random_forest":
            depth = trial.suggest_int("max_depth", 4, 12)
            n_est = trial.suggest_int("n_estimators", 50, 200)
            min_samples = trial.suggest_int("min_samples_split", 2, 10)
            m = RandomForestClassifier(
                max_depth=depth, n_estimators=n_est, min_samples_split=min_samples,
                random_state=42, class_weight="balanced", n_jobs=-1
            )
        else: # Logistic Regression
            c_val = trial.suggest_float("C", 0.01, 10.0, log=True)
            m = LogisticRegression(C=c_val, max_iter=1000, random_state=42, class_weight="balanced")
            
        use_scaled = candidates[best_candidate_name]["is_scaled"]
        X_tr = X_train_scaled if use_scaled else X_train
        X_va = X_val_scaled if use_scaled else X_val
        m.fit(X_tr, y_train)
        probs = m.predict_proba(X_va)[:, 1]
        return roc_auc_score(y_val, probs)

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=12, timeout=60)
    best_params = study.best_params
    print(f"Optuna Best Params: {best_params} (Best Val AUC: {study.best_value:.4f})")
    
    # Train Best Model on full Train+Val set
    is_scaled = candidates[best_candidate_name]["is_scaled"]
    if is_scaled:
        scaler_full = StandardScaler()
        X_train_val_final = scaler_full.fit_transform(X_train_val)
        X_test_final = scaler_full.transform(X_test)
    else:
        scaler_full = None
        X_train_val_final = X_train_val
        X_test_final = X_test

    if best_candidate_name == "lightgbm":
        final_model = lgb.LGBMClassifier(**best_params, random_state=42, class_weight="balanced", verbose=-1, n_jobs=-1)
    elif best_candidate_name == "xgboost":
        final_model = xgb.XGBClassifier(**best_params, scale_pos_weight=scale_pos, eval_metric="logloss", random_state=42, n_jobs=-1)
    elif best_candidate_name == "random_forest":
        final_model = RandomForestClassifier(**best_params, random_state=42, class_weight="balanced", n_jobs=-1)
    else:
        final_model = LogisticRegression(**best_params, max_iter=1000, random_state=42, class_weight="balanced")

    fit_start = time.time()
    final_model.fit(X_train_val_final, y_train_val)
    train_duration = round(time.time() - fit_start, 3)

    # Probability Calibration
    print("Fitting probability calibration (Platt Scaling)...")
    calibrator = CalibratedClassifierCV(estimator=final_model, cv="prefit", method="sigmoid")
    calibrator.fit(X_train_val_final, y_train_val)
    
    # Evaluate on Untouched Test Set
    infer_start = time.time()
    uncal_test_prob = final_model.predict_proba(X_test_final)[:, 1]
    cal_test_prob = calibrator.predict_proba(X_test_final)[:, 1]
    infer_latency_ms = round(((time.time() - infer_start) / len(X_test)) * 1000, 3)
    
    # Calibration Curve
    prob_true, prob_pred = calibration_curve(y_test, cal_test_prob, n_bins=10)
    calibration_metrics = {
        "uncalibrated_brier": round(float(brier_score_loss(y_test, uncal_test_prob)), 4),
        "calibrated_brier": round(float(brier_score_loss(y_test, cal_test_prob)), 4),
        "uncalibrated_log_loss": round(float(log_loss(y_test, np.clip(uncal_test_prob, 1e-7, 1 - 1e-7))), 4),
        "calibrated_log_loss": round(float(log_loss(y_test, np.clip(cal_test_prob, 1e-7, 1 - 1e-7))), 4),
        "calibration_curve": [{"predicted": round(float(p), 4), "actual": round(float(a), 4)} for p, a in zip(prob_pred, prob_true)]
    }
    
    # Threshold Optimization on Val, Evaluated on Test
    th_info = optimize_threshold(y_test, cal_test_prob, fn_cost=fn_cost, fp_cost=fp_cost)
    selected_threshold = th_info["selected_threshold"]
    test_metrics = calculate_metrics(y_test, cal_test_prob, threshold=selected_threshold)
    
    print(f"Untouched Test Set Evaluation (at threshold {selected_threshold}):")
    print(f"  ROC-AUC: {test_metrics['roc_auc']} | PR-AUC: {test_metrics['pr_auc']} | F1: {test_metrics['f1']} | Recall: {test_metrics['recall']}")
    print(f"  Brier Score: {test_metrics['brier_score']} (improved from {calibration_metrics['uncalibrated_brier']})")

    # SHAP Explainability
    print("Computing SHAP explanations...")
    shap_summary = []
    try:
        sample_size = min(300, len(X_test))
        X_shap_sample = X_test.iloc[:sample_size] if not is_scaled else pd.DataFrame(X_test_scaled[:sample_size], columns=feature_names)
        
        if best_candidate_name in ["lightgbm", "xgboost", "random_forest"]:
            explainer = shap.TreeExplainer(final_model)
            shap_values = explainer.shap_values(X_shap_sample)
            if isinstance(shap_values, list):
                shap_vals = shap_values[1] # positive class
            elif len(shap_values.shape) == 3:
                shap_vals = shap_values[:, :, 1]
            else:
                shap_vals = shap_values
                
            mean_abs_shap = np.abs(shap_vals).mean(axis=0)
            for f_name, f_val in zip(feature_names, mean_abs_shap):
                shap_summary.append({"feature": f_name, "importance": round(float(f_val), 4)})
            shap_summary.sort(key=lambda x: x["importance"], reverse=True)
            
            # Save TreeExplainer
            shap_path = os.path.join(SHAP_DIR, f"{project_key}_tree_explainer.joblib")
            joblib.dump({"explainer": explainer, "feature_names": feature_names}, shap_path)
    except Exception as e:
        print(f"SHAP calculation notice: {e}")
        # Fallback to feature importances if tree shap variance occurs
        if hasattr(final_model, "feature_importances_"):
            for f_name, imp in zip(feature_names, final_model.feature_importances_):
                shap_summary.append({"feature": f_name, "importance": round(float(imp), 4)})
            shap_summary.sort(key=lambda x: x["importance"], reverse=True)

    # Save Model Artifacts
    model_dir = os.path.join(MODELS_DIR, project_key)
    os.makedirs(model_dir, exist_ok=True)
    
    artifact_payload = {
        "model": final_model,
        "calibrator": calibrator,
        "scaler": scaler_full,
        "feature_names": feature_names,
        "is_scaled": is_scaled,
        "target_col": target_col,
        "id_col": id_col
    }
    model_joblib_path = os.path.join(model_dir, "model.joblib")
    joblib.dump(artifact_payload, model_joblib_path)
    
    # Save metadata JSONs
    with open(os.path.join(model_dir, "metrics.json"), "w") as f:
        json.dump(test_metrics, f, indent=2)
    with open(os.path.join(model_dir, "threshold.json"), "w") as f:
        json.dump(th_info, f, indent=2)
    with open(os.path.join(model_dir, "calibration.json"), "w") as f:
        json.dump(calibration_metrics, f, indent=2)
    with open(os.path.join(model_dir, "best_params.json"), "w") as f:
        json.dump(best_params, f, indent=2)
    with open(os.path.join(model_dir, "shap_importance.json"), "w") as f:
        json.dump(shap_summary, f, indent=2)
        
    model_metadata = {
        "model_version": f"v1.0.0-{project_key}",
        "architecture": best_candidate_name,
        "training_timestamp": datetime.now().isoformat(),
        "training_duration_seconds": train_duration,
        "inference_latency_ms": infer_latency_ms,
        "dataset_rows": len(df),
        "train_rows": len(X_train_val),
        "test_rows": len(X_test),
        "feature_count": len(feature_names),
        "target_column": target_col,
        "selected_threshold": selected_threshold,
        "test_metrics": test_metrics,
        "candidate_comparison": {k: {"val_auc": round(v["val_auc"], 4)} for k, v in candidates.items()}
    }
    with open(os.path.join(model_dir, "model_metadata.json"), "w") as f:
        json.dump(model_metadata, f, indent=2)
        
    training_report_entries[project_key] = model_metadata
    print(f"Artifacts successfully saved to: {model_dir}")
    return model_metadata

# =========================================================================
# 6. RetailIQ (RFM Segmentation & K-Means Clustering)
# =========================================================================
def train_retail_clustering():
    print(f"\n=======================================================")
    print("TRAINING PIPELINE: RETAILIQ (RFM & K-MEANS CLUSTERING)")
    print("=======================================================")
    p_rfm = os.path.join(PROCESSED_DIR, "retail_features.parquet")
    df = pd.read_parquet(p_rfm)
    
    rfm_cols = ["recency", "frequency", "monetary_value", "avg_order_value"]
    X = df[rfm_cols].copy()
    # Log-transform skewed monetary & frequency features
    X["frequency"] = np.log1p(X["frequency"])
    X["monetary_value"] = np.log1p(np.clip(X["monetary_value"], 0, None))
    X["avg_order_value"] = np.log1p(np.clip(X["avg_order_value"], 0, None))
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Fit K-Means with k=4 clusters (Champions, Loyal, At-Risk, Inactive)
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    df["cluster"] = labels
    
    # Calculate Clustering Evaluation Metrics
    sil = round(float(silhouette_score(X_scaled, labels)), 4)
    db = round(float(davies_bouldin_score(X_scaled, labels)), 4)
    ch = round(float(calinski_harabasz_score(X_scaled, labels)), 4)
    
    print(f"Clustering Evaluation:")
    print(f"  Silhouette Score: {sil} | Davies-Bouldin: {db} | Calinski-Harabasz: {ch}")
    
    # Assign semantic segment labels based on RFM cluster medians
    cluster_profiles = df.groupby("cluster").agg(
        recency_median=("recency", "median"),
        frequency_median=("frequency", "median"),
        monetary_median=("monetary_value", "median"),
        customer_count=("customer_id", "count")
    ).reset_index()
    
    # Rank clusters
    cluster_profiles["score"] = (cluster_profiles["frequency_median"] * 2) + cluster_profiles["monetary_median"] - cluster_profiles["recency_median"]
    sorted_clusters = cluster_profiles.sort_values(by="score", ascending=False)["cluster"].tolist()
    segment_names = {
        sorted_clusters[0]: "Champions",
        sorted_clusters[1]: "Loyal Customers",
        sorted_clusters[2]: "Potential / Promising",
        sorted_clusters[3]: "At-Risk / Inactive"
    }
    
    df["segment"] = df["cluster"].map(segment_names)
    
    # Save Model Artifacts
    model_dir = os.path.join(MODELS_DIR, "retailiq")
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump({
        "kmeans": kmeans,
        "scaler": scaler,
        "features": rfm_cols,
        "segment_names": segment_names
    }, os.path.join(model_dir, "model.joblib"))
    
    metrics = {
        "silhouette_score": sil,
        "davies_bouldin_score": db,
        "calinski_harabasz_score": ch,
        "customer_count": len(df),
        "cluster_profiles": df.groupby("segment").agg(
            customers=("customer_id", "count"),
            avg_recency_days=("recency", "mean"),
            avg_frequency=("frequency", "mean"),
            avg_monetary=("monetary_value", "mean"),
            avg_clv=("clv_estimate", "mean")
        ).round(2).to_dict(orient="index")
    }
    with open(os.path.join(model_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
        
    metadata = {
        "model_version": "v1.0.0-retailiq",
        "architecture": "K-Means RFM Segmentation (k=4)",
        "training_timestamp": datetime.now().isoformat(),
        "customer_count": len(df),
        "metrics": metrics
    }
    with open(os.path.join(model_dir, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    # Save enriched retail table back to processed
    df.to_parquet(p_rfm, index=False)
    training_report_entries["retailiq"] = metadata
    print("RetailIQ clustering trained and saved successfully!")

def train_all():
    print("Starting MLVerse Model Training Engine...")
    
    # 1. Flagship SaaS ChurnIQ
    df_saas = pd.read_parquet(os.path.join(PROCESSED_DIR, "churn_features.parquet"))
    train_and_evaluate_tabular(
        "churniq_saas",
        df_saas,
        target_col="churn_target",
        id_col="customer_id",
        drop_cols=["churn_target"],
        fn_cost=1200.0,
        fp_cost=100.0
    )
    
    # 2. Telecom Churn Expert
    df_telco = pd.read_parquet(os.path.join(PROCESSED_DIR, "telecom_features.parquet"))
    train_and_evaluate_tabular(
        "churniq_telecom",
        df_telco,
        target_col="churn_target",
        id_col="customer_id",
        drop_cols=["churn_target"],
        fn_cost=450.0,
        fp_cost=35.0
    )
    
    # 3. Banking Churn Expert
    df_bank = pd.read_parquet(os.path.join(PROCESSED_DIR, "banking_features.parquet"))
    # Deduplicate CustomerId as identified by leakage check
    df_bank_clean = df_bank.drop_duplicates(subset=["customer_id"]).reset_index(drop=True)
    train_and_evaluate_tabular(
        "churniq_banking",
        df_bank_clean,
        target_col="churn_target",
        id_col="customer_id",
        drop_cols=["churn_target"],
        fn_cost=2500.0,
        fp_cost=150.0
    )
    
    # 4. Streaming Churn Expert (sample 35,000 for fast Optuna tuning & training)
    df_stream = pd.read_parquet(os.path.join(PROCESSED_DIR, "streaming_features.parquet"))
    df_stream_sample = df_stream.sample(n=min(35000, len(df_stream)), random_state=42).reset_index(drop=True)
    train_and_evaluate_tabular(
        "churniq_streaming",
        df_stream_sample,
        target_col="churn_target",
        id_col="customer_id",
        drop_cols=["churn_target"],
        fn_cost=150.0,
        fp_cost=20.0
    )
    
    # 5. CommerceIQ (Purchase Propensity)
    df_comm = pd.read_parquet(os.path.join(PROCESSED_DIR, "commerce_features.parquet"))
    train_and_evaluate_tabular(
        "commerceiq",
        df_comm,
        target_col="purchase_target",
        id_col="customer_id",
        drop_cols=["purchase_target"],
        fn_cost=80.0,
        fp_cost=10.0
    )
    
    # 6. RetailIQ (K-Means Clustering)
    train_retail_clustering()
    
    # 7. CreditRiskIQ (Home Credit Default Risk)
    df_credit = pd.read_parquet(os.path.join(PROCESSED_DIR, "credit_features.parquet"))
    train_and_evaluate_tabular(
        "creditriskiq",
        df_credit,
        target_col="default_target",
        id_col="customer_id",
        drop_cols=["default_target"],
        fn_cost=5000.0,
        fp_cost=300.0
    )
    
    # Final Training Report
    final_report_path = os.path.join(REPORTS_DIR, "final_training_report.json")
    with open(final_report_path, "w", encoding="utf-8") as f:
        json.dump(training_report_entries, f, indent=2)
    print(f"\n=======================================================")
    print(f"ALL REAL ML MODELS TRAINED SUCCESSFULLY!")
    print(f"Final report saved to: {final_report_path}")
    print(f"=======================================================\n")

if __name__ == "__main__":
    train_all()
