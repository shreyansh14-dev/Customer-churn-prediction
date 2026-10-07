"""
MLVerse FastAPI REST API Endpoints
"""

import io
import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from backend.database.session import get_db, Base, engine
from backend.database.models import BusinessProfile, AnalysisRun
from backend.schemas.api_schemas import (
    BusinessCreate, BusinessResponse, SinglePredictionRequest,
    PredictionResponse, BatchPredictionRequest, BatchPredictionResponse,
    BusinessHealthResponse, ColumnMappingRequest, ColumnMappingResponse,
    SegmentRequest, SegmentResponse
)
from backend.services.model_registry import registry
from backend.services.scoring_engine import score_customer
from backend.services.health_engine import compute_business_health
from backend.services.upload_service import (
    detect_column_mappings, validate_uploaded_data, get_demo_customers
)
from backend.services.feature_engineering import (
    detect_domain_from_columns, engineer_features, get_model_for_domain
)

# Create tables
Base.metadata.create_all(bind=engine)

router = APIRouter()

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
REPORTS_DIR = os.path.join(PROJECT_DIR, "artifacts", "reports")

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "loaded_models_count": len(registry.models),
        "available_models": list(registry.models.keys())
    }

@router.get("/projects")
def list_projects():
    return {
        "flagship": "ChurnIQ",
        "tagline": "Predict. Explain. Retain.",
        "projects": [
            {
                "id": "churniq",
                "name": "ChurnIQ",
                "domain": "Customer Retention & Subscription Health",
                "status": "Active (Flagship)",
                "models": ["churniq_saas", "churniq_telecom", "churniq_banking", "churniq_streaming"],
                "description": "Multi-domain customer churn prediction, risk scoring, and retention intelligence."
            },
            {
                "id": "commerceiq",
                "name": "CommerceIQ",
                "domain": "E-Commerce Clickstream & Intent",
                "status": "Active",
                "models": ["commerceiq"],
                "description": "Purchase propensity, session conversion prediction, and engagement scoring."
            },
            {
                "id": "retailiq",
                "name": "RetailIQ",
                "domain": "Retail & Transaction Intelligence",
                "status": "Active",
                "models": ["retailiq"],
                "description": "RFM segmentation, K-Means clustering, and Customer Lifetime Value (CLV)."
            },
            {
                "id": "creditriskiq",
                "name": "CreditRiskIQ",
                "domain": "Fintech & Lending Risk",
                "status": "Active",
                "models": ["creditriskiq"],
                "description": "Credit risk probability estimation, applicant scoring, and financial transparency."
            }
        ]
    }

@router.get("/datasets")
def get_datasets():
    inv_path = os.path.join(REPORTS_DIR, "dataset_inventory.json")
    if os.path.exists(inv_path):
        with open(inv_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/models")
def list_models():
    models_summary = []
    for name, artifact in registry.models.items():
        meta = registry.metadata.get(name, {})
        metrics = meta.get("test_metrics") or meta.get("metrics", {})
        th = registry.get_threshold(name)
        models_summary.append({
            "model_id": name,
            "architecture": meta.get("architecture", "Unknown"),
            "model_version": meta.get("model_version", "v1.0.0"),
            "training_timestamp": meta.get("training_timestamp"),
            "selected_threshold": th,
            "metrics": metrics,
            "feature_count": len(artifact.get("feature_names", [])) if isinstance(artifact, dict) and "feature_names" in artifact else None,
            "candidate_comparison": meta.get("candidate_comparison", {})
        })
    return models_summary

@router.get("/model-info")
def get_model_info(model_name: str = Query("churniq_saas")):
    artifact = registry.get_model(model_name)
    if not artifact:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
    
    meta = registry.metadata.get(model_name, {})
    th_data = registry.thresholds.get(model_name, {})
    cal_data = registry.calibrations.get(model_name, {})
    shap_data = registry.shap_importances.get(model_name, [])

    return {
        "model_name": model_name,
        "metadata": meta,
        "threshold": th_data,
        "calibration": cal_data,
        "shap_importance": shap_data,
        "feature_names": artifact.get("feature_names", [])
    }

@router.get("/metrics")
def get_all_metrics():
    rep_path = os.path.join(REPORTS_DIR, "final_training_report.json")
    if os.path.exists(rep_path):
        with open(rep_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@router.post("/businesses")
def create_business(payload: BusinessCreate, db: Session = Depends(get_db)):
    biz = BusinessProfile(**payload.dict())
    db.add(biz)
    db.commit()
    db.refresh(biz)
    return {
        "id": biz.id,
        "business_name": biz.business_name,
        "industry": biz.industry,
        "business_model": biz.business_model,
        "country": biz.country,
        "created_at": biz.created_at.isoformat()
    }

@router.post("/mapping/detect", response_model=ColumnMappingResponse)
def detect_mapping(payload: ColumnMappingRequest):
    result = detect_column_mappings(payload.columns)
    return result

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    lower_name = (file.filename or "").lower()
    try:
        if lower_name.endswith(".parquet"):
            df = pd.read_parquet(io.BytesIO(contents))
        elif lower_name.endswith((".csv", ".txt", ".csv.gz")):
            df = pd.read_csv(io.BytesIO(contents))
        elif lower_name.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Upload CSV, Excel (.xlsx/.xls), or Parquet.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    validation = validate_uploaded_data(df)
    mapping = detect_column_mappings(list(df.columns))

    # Auto-detect domain and map model
    detected_domain = detect_domain_from_columns(list(df.columns))
    recommended_model = get_model_for_domain(detected_domain)
    mapping["detected_domain"] = detected_domain.title()
    mapping["recommended_model"] = recommended_model

    # Run feature engineering pipeline on the raw uploaded dataframe
    engineered_df, _, _ = engineer_features(df, domain=detected_domain)

    # Drop ground-truth target columns so the model scores fresh
    TARGET_COLS = ["churn_target", "churned", "Exited", "TARGET", "churn", "Churn", "churn_flag"]
    df_scored = df.copy()
    for tc in TARGET_COLS:
        if tc in df_scored.columns:
            df_scored.drop(columns=[tc], inplace=True)

    # Merge engineered features with raw columns (so frontend can show both raw data & feed model features)
    for col in engineered_df.columns:
        if col not in df_scored.columns:
            df_scored[col] = engineered_df[col]

    # Fill NaN with 0 / empty string for JSON serialisation
    df_scored = df_scored.fillna(0)

    # Return up to 2 000 rows so the frontend can run real batch scoring
    MAX_ROWS = 2000
    all_rows = df_scored.head(MAX_ROWS).to_dict(orient="records")

    return {
        "filename": file.filename,
        "validation": validation,
        "mapping": mapping,
        "detected_domain": detected_domain,
        "recommended_model": recommended_model,
        "rows": all_rows
    }

@router.get("/demo-data")
def get_demo_data_endpoint(domain: str = Query("saas"), limit: int = Query(30)):
    return {
        "domain": domain,
        "count": limit,
        "customers": get_demo_customers(domain=domain, limit=limit)
    }

@router.post("/predict/churn", response_model=PredictionResponse)
def predict_churn(payload: SinglePredictionRequest):
    model_name = payload.model_override or "churniq_saas"
    res = score_customer(model_name, payload.features, customer_id=payload.customer_id)
    return res

@router.post("/predict/ecommerce", response_model=PredictionResponse)
def predict_ecommerce(payload: SinglePredictionRequest):
    res = score_customer("commerceiq", payload.features, customer_id=payload.customer_id)
    return res

@router.post("/predict/credit-risk", response_model=PredictionResponse)
def predict_credit_risk(payload: SinglePredictionRequest):
    res = score_customer("creditriskiq", payload.features, customer_id=payload.customer_id)
    return res

@router.post("/predict-batch", response_model=BatchPredictionResponse)
def predict_batch(payload: BatchPredictionRequest):
    customers = payload.customers or []
    if not customers:
        return {
            "model_name": payload.model_name or "churniq_saas",
            "model_version": "v1.0.0",
            "total_processed": 0,
            "high_risk_count": 0,
            "medium_risk_count": 0,
            "low_risk_count": 0,
            "critical_risk_count": 0,
            "avg_probability": 0.0,
            "revenue_exposure": 0.0,
            "results": []
        }

    df_in = pd.DataFrame(customers)
    detected_domain = detect_domain_from_columns(list(df_in.columns))
    auto_model = get_model_for_domain(detected_domain)
    
    # If model is not explicitly valid in registry or is default churniq_saas on non-saas data, use detected domain model
    if payload.model_name in registry.models and payload.model_name != "churniq_saas":
        model_name = payload.model_name
    elif payload.model_name in registry.models and detected_domain == "saas":
        model_name = payload.model_name
    else:
        model_name = auto_model

    # Check if required model features are missing from input
    meta_model = registry.get_model(model_name)
    req_feats = meta_model.get("feature_names", []) if isinstance(meta_model, dict) else []
    missing_feats = [f for f in req_feats if f not in df_in.columns]

    if len(missing_feats) > len(req_feats) * 0.3:
        # Run feature engineering
        feat_df, dom, m_name = engineer_features(df_in, domain=detected_domain)
        for c in feat_df.columns:
            df_in[c] = feat_df[c]
        records_to_score = df_in.to_dict(orient="records")
    else:
        records_to_score = customers

    scored_list = []
    for idx, c in enumerate(records_to_score):
        c_id = c.get("_id", c.get("customer_id", c.get("customerID", c.get("CustomerID", c.get("user_id", f"CUST-{idx+1:04d}")))))
        scored = score_customer(model_name, c, customer_id=str(c_id))
        scored_list.append(scored)

    total = len(scored_list)
    high_count = sum(1 for s in scored_list if s["risk_level"] == "HIGH")
    med_count = sum(1 for s in scored_list if s["risk_level"] == "MEDIUM")
    low_count = sum(1 for s in scored_list if s["risk_level"] == "LOW")
    crit_count = sum(1 for s in scored_list if s["risk_level"] == "CRITICAL")
    avg_p = float(np.mean([s["probability"] for s in scored_list])) if total > 0 else 0.0

    # Calculate real domain-aware revenue exposure
    exposure = 0.0
    for i, s in enumerate(scored_list):
        if s["risk_level"] in ["HIGH", "CRITICAL"]:
            c = records_to_score[i]
            val = 0.0
            if "arr" in c and float(c.get("arr", 0) or 0) > 0:
                val = float(c["arr"])
            elif ("MonthlyCharges" in c or "monthly_charges" in c) and float(c.get("MonthlyCharges", c.get("monthly_charges", 0)) or 0) > 0:
                val = float(c.get("MonthlyCharges", c.get("monthly_charges", 0.0)) or 0.0) * 12.0
            elif ("mrr" in c or "monthly_revenue" in c) and float(c.get("mrr", c.get("monthly_revenue", 0)) or 0) > 0:
                val = float(c.get("mrr", c.get("monthly_revenue", 0.0)) or 0.0) * 12.0
            elif "TotalCharges" in c and float(c.get("TotalCharges", 0) or 0) > 0:
                val = float(c["TotalCharges"])
            elif "Balance" in c and float(c.get("Balance", 0) or 0) > 0:
                val = float(c["Balance"])
            elif "customer_value" in c and float(c.get("customer_value", 0) or 0) > 0:
                val = float(c["customer_value"])
            elif "monetary_value" in c and float(c.get("monetary_value", 0) or 0) > 0:
                val = float(c["monetary_value"])
            else:
                val = 120.0
            exposure += val

    meta = registry.metadata.get(model_name, {})
    return {
        "model_name": model_name,
        "model_version": meta.get("model_version", "v1.0.0"),
        "total_processed": total,
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "critical_risk_count": crit_count,
        "avg_probability": round(avg_p, 4),
        "revenue_exposure": round(exposure, 2),
        "results": scored_list
    }

@router.post("/explain")
def explain_customer(payload: SinglePredictionRequest):
    model_name = payload.model_override or "churniq_saas"
    res = score_customer(model_name, payload.features, customer_id=payload.customer_id)
    shap_data = registry.shap_importances.get(model_name, [])
    return {
        "customer_id": res["customer_id"],
        "probability": res["probability"],
        "risk_level": res["risk_level"],
        "top_risk_factors": res["top_risk_factors"],
        "protective_factors": res["protective_factors"],
        "global_shap_importance": shap_data[:10]
    }

@router.post("/segment", response_model=SegmentResponse)
def segment_customers(payload: SegmentRequest):
    artifact = registry.get_model("retailiq")
    if not artifact or "kmeans" not in artifact:
        raise HTTPException(status_code=500, detail="RetailIQ model not loaded")

    kmeans = artifact["kmeans"]
    scaler = artifact["scaler"]
    rfm_cols = artifact["features"]
    segment_names = artifact["segment_names"]

    df = pd.DataFrame(payload.customers)
    for c in rfm_cols:
        if c not in df.columns:
            df[c] = 0.0
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0.0)

    X = df[rfm_cols].copy()
    X["frequency"] = np.log1p(X["frequency"])
    X["monetary_value"] = np.log1p(np.clip(X["monetary_value"], 0, None))
    X["avg_order_value"] = np.log1p(np.clip(X["avg_order_value"], 0, None))

    X_scaled = scaler.transform(X)
    clusters = kmeans.predict(X_scaled)
    df["cluster"] = clusters
    df["segment"] = df["cluster"].map(segment_names)

    meta = registry.metadata.get("retailiq", {}).get("metrics", {})
    sil = meta.get("silhouette_score", 0.34)

    counts = df["segment"].value_counts().to_dict()
    results = df[["customer_id", "recency", "frequency", "monetary_value", "segment"]].to_dict(orient="records")

    return {
        "total_customers": len(df),
        "silhouette_score": sil,
        "segments": counts,
        "results": results
    }

@router.post("/business-health", response_model=BusinessHealthResponse)
def evaluate_business_health(payload: BatchPredictionRequest):
    customers = payload.customers or []
    if not customers:
        return compute_business_health([], [])

    df_in = pd.DataFrame(customers)
    detected_domain = detect_domain_from_columns(list(df_in.columns))
    auto_model = get_model_for_domain(detected_domain)
    if payload.model_name in registry.models and payload.model_name != "churniq_saas":
        model_name = payload.model_name
    elif payload.model_name in registry.models and detected_domain == "saas":
        model_name = payload.model_name
    else:
        model_name = auto_model

    meta_model = registry.get_model(model_name)
    req_feats = meta_model.get("feature_names", []) if isinstance(meta_model, dict) else []
    missing_feats = [f for f in req_feats if f not in df_in.columns]

    if len(missing_feats) > len(req_feats) * 0.3:
        feat_df, dom, m_name = engineer_features(df_in, domain=detected_domain)
        for c in feat_df.columns:
            df_in[c] = feat_df[c]
        records = df_in.to_dict(orient="records")
    else:
        records = customers

    scored_list = []
    for idx, c in enumerate(records):
        c_id = c.get("_id", c.get("customer_id", c.get("CustomerID", c.get("user_id", f"CUST-{idx+1:04d}"))))
        scored = score_customer(model_name, c, customer_id=str(c_id))
        scored_list.append(scored)

    health = compute_business_health(scored_list, records)
    return health
