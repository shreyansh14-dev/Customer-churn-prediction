"""
MLVerse Dataset Validation and Quality Scoring Script
Inspects each candidate dataset for:
- Completeness (missing values, null rates)
- Entity uniqueness and duplicate keys
- Target presence and class balance
- Outliers and anomalous values
- Data Quality Score (0 - 100)
Outputs artifacts/reports/data_quality_report.json
"""

import os
import json
import zipfile
import pandas as pd
import numpy as np
import pyarrow.parquet as pq

RAW_DIR = r"D:\customer churn prediction"
PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
REPORTS_DIR = os.path.join(PROJECT_DIR, "artifacts", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

def compute_quality_score(df, id_col, target_col):
    """
    Transparent Data Quality Score Formula:
    Score = 100 - (missing_penalty * 30) - (duplicate_penalty * 25) - (outlier_penalty * 15) - (imbalance_penalty * 10) - (target_missing_penalty * 20)
    """
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = df.isnull().sum().sum()
    missing_rate = missing_cells / total_cells if total_cells > 0 else 0
    missing_penalty = min(missing_rate * 2, 1.0) # up to 30 points off

    duplicate_rate = 0.0
    if id_col and id_col in df.columns:
        duplicate_rate = df[id_col].duplicated().mean()
    duplicate_penalty = min(duplicate_rate * 5, 1.0) # up to 25 points off

    # Target missingness
    target_missing = 0.0
    imbalance_penalty = 0.0
    if target_col and target_col in df.columns:
        target_missing = df[target_col].isnull().mean()
        # class balance check
        val_counts = df[target_col].value_counts(normalize=True)
        if len(val_counts) == 2:
            min_class = val_counts.min()
            # If extremely rare (< 1%) or completely skewed
            if min_class < 0.05:
                imbalance_penalty = 0.5
            elif min_class < 0.01:
                imbalance_penalty = 1.0

    # Numeric outlier detection (IQR)
    num_cols = df.select_dtypes(include=[np.number]).columns
    outlier_cells = 0
    for c in num_cols:
        q1 = df[c].quantile(0.25)
        q3 = df[c].quantile(0.75)
        iqr = q3 - q1
        if iqr > 0:
            outliers = ((df[c] < (q1 - 3 * iqr)) | (df[c] > (q3 + 3 * iqr))).sum()
            outlier_cells += outliers
    num_total = len(num_cols) * len(df)
    outlier_rate = outlier_cells / num_total if num_total > 0 else 0
    outlier_penalty = min(outlier_rate * 5, 1.0)

    score = 100.0 - (missing_penalty * 30) - (duplicate_penalty * 25) - (outlier_penalty * 15) - (imbalance_penalty * 10) - (target_missing * 20)
    score = max(round(score, 1), 10.0)

    return {
        "score": score,
        "metrics": {
            "total_rows": int(len(df)),
            "total_columns": int(len(df.columns)),
            "missing_cells": int(missing_cells),
            "missing_percentage": round(missing_rate * 100, 2),
            "duplicate_id_rate": round(duplicate_rate * 100, 2),
            "outlier_rate": round(outlier_rate * 100, 2),
            "target_available": bool(target_col and target_col in df.columns),
            "target_missing_pct": round(target_missing * 100, 2)
        }
    }

def validate_all():
    print("Running Dataset Validation & Data Quality Analysis...")
    report = {}

    # 1. Telecom Churn (dataset.csv)
    p_telco = os.path.join(RAW_DIR, "dataset.csv")
    df_telco = pd.read_csv(p_telco)
    df_telco["TotalCharges"] = pd.to_numeric(df_telco["TotalCharges"].astype(str).str.strip(), errors="coerce")
    report["telecom_churn"] = {
        "dataset": "Telecom Customer Churn",
        "file": "dataset.csv",
        "domain": "Telecom",
        "entity": "customerID",
        "target": "Churn",
        "quality": compute_quality_score(df_telco, "customerID", "Churn")
    }

    # 2. SaaS Users & Monthly Parquet
    p_users = os.path.join(RAW_DIR, "users.parquet")
    df_users = pd.read_parquet(p_users)
    report["saas_users"] = {
        "dataset": "B2B SaaS Users Profile",
        "file": "users.parquet",
        "domain": "B2B SaaS",
        "entity": "user_id",
        "target": "None (Demographics & Plans)",
        "quality": compute_quality_score(df_users, "user_id", None)
    }

    p_um = os.path.join(RAW_DIR, "user_monthly.parquet")
    df_um = pd.read_parquet(p_um)
    report["saas_monthly"] = {
        "dataset": "B2B SaaS Monthly Longitudinal Observations",
        "file": "user_monthly.parquet",
        "domain": "B2B SaaS",
        "entity": "user_id",
        "target": "churned_next_month",
        "quality": compute_quality_score(df_um, None, "churned_next_month")
    }

    # 3. Bank Customer Churn
    p_bank = os.path.join(RAW_DIR, "bank-customer-churn-prediction-challenge.zip")
    with zipfile.ZipFile(p_bank) as z:
        with z.open("train.csv") as f:
            df_bank = pd.read_csv(f)
            report["banking_churn"] = {
                "dataset": "Bank Customer Churn",
                "file": "bank-customer-churn-prediction-challenge.zip/train.csv",
                "domain": "Banking",
                "entity": "CustomerId",
                "target": "Exited",
                "quality": compute_quality_score(df_bank, "CustomerId", "Exited")
            }

    # 4. Streaming Subscription Churn
    p_stream = os.path.join(RAW_DIR, "streaming-subscription-churn-model.zip")
    with zipfile.ZipFile(p_stream) as z:
        with z.open("train.csv") as f:
            df_stream = pd.read_csv(f)
            report["streaming_churn"] = {
                "dataset": "Streaming Media Subscription Churn",
                "file": "streaming-subscription-churn-model.zip/train.csv",
                "domain": "Media & Streaming",
                "entity": "customer_id",
                "target": "churned",
                "quality": compute_quality_score(df_stream, "customer_id", "churned")
            }

    # 5. Home Credit Default Risk
    p_credit = os.path.join(RAW_DIR, "home-credit-default-risk.zip")
    with zipfile.ZipFile(p_credit) as z:
        with z.open("application_train.csv") as f:
            df_credit = pd.read_csv(f, nrows=25000) # sample for quick validation quality check
            report["credit_risk"] = {
                "dataset": "Home Credit Loan Applications",
                "file": "home-credit-default-risk.zip/application_train.csv",
                "domain": "Fintech & Lending",
                "entity": "SK_ID_CURR",
                "target": "TARGET",
                "quality": compute_quality_score(df_credit, "SK_ID_CURR", "TARGET")
            }

    out_file = os.path.join(REPORTS_DIR, "data_quality_report.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Validation complete! Report saved to: {out_file}")
    for k, v in report.items():
        print(f"  {v['dataset']}: Quality Score = {v['quality']['score']}/100 (Missing: {v['quality']['metrics']['missing_percentage']}%, Rows: {v['quality']['metrics']['total_rows']})")

if __name__ == "__main__":
    validate_all()
