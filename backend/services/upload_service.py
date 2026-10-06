"""
MLVerse Upload Validation, Intelligent Column Mapping & Demo Data Service
"""

import os
import io
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
PROCESSED_DIR = os.path.join(PROJECT_DIR, "data", "processed")

CANONICAL_SYNONYMS = {
    "customer_id": ["customer_id", "user_id", "account_id", "client_id", "customerid", "userid", "id", "cust_id"],
    "tenure": ["tenure", "tenure_months", "months_active", "account_age", "subscription_length", "tenure_month"],
    "mrr": ["mrr", "monthly_charges", "monthly_revenue", "monthly_fee", "monthly_price", "monthlycharges", "price"],
    "arr": ["arr", "annual_revenue", "annual_charges", "total_annual_value"],
    "sessions": ["sessions", "sessions_last_month", "logins", "activity_count", "events", "sessions_per_month"],
    "feature_usage_score": ["feature_usage_score", "usage_score", "adoption_score", "engagement_score", "feature_adoption"],
    "support_tickets": ["support_tickets", "tickets", "inquiries", "customer_service_inquiries", "support_burden", "support_tickets_total"],
    "payment_failures": ["payment_failures", "failed_payments", "billing_failures", "failed_charges", "payment_failures_total"],
    "company_size": ["company_size", "team_size", "employees", "size", "seats", "active_seats"]
}

def detect_column_mappings(columns: List[str]) -> Dict[str, Any]:
    mappings = {}
    confidence = {}
    
    col_lookup = {c.lower().replace("-", "_").replace(" ", "_"): c for c in columns}
    
    for canon_name, syn_list in CANONICAL_SYNONYMS.items():
        matched = False
        # Exact match
        for syn in syn_list:
            if syn in col_lookup:
                orig_col = col_lookup[syn]
                mappings[orig_col] = canon_name
                confidence[orig_col] = "HIGH CONFIDENCE"
                matched = True
                break
        if not matched:
            # Substring match
            for col_clean, orig_col in col_lookup.items():
                if orig_col in mappings:
                    continue
                for syn in syn_list:
                    if syn in col_clean or col_clean in syn:
                        mappings[orig_col] = canon_name
                        confidence[orig_col] = "MEDIUM CONFIDENCE"
                        matched = True
                        break
                if matched:
                    break

    # Unmapped columns
    for orig_col in columns:
        if orig_col not in mappings:
            mappings[orig_col] = "unmapped"
            confidence[orig_col] = "MANUAL MAPPING REQUIRED"

    # Infer domain based on mapped columns
    domain = "SaaS"
    if any("phone" in c.lower() or "fiber" in c.lower() or "partner" in c.lower() for c in columns):
        domain = "Telecom"
    elif any("credit" in c.lower() or "balance" in c.lower() or "salary" in c.lower() for c in columns):
        domain = "Banking"
    elif any("song" in c.lower() or "playlist" in c.lower() or "stream" in c.lower() for c in columns):
        domain = "Streaming"
    elif any("invoice" in c.lower() or "quantity" in c.lower() or "stock" in c.lower() for c in columns):
        domain = "Retail"

    recommended_model = "churniq_saas"
    if domain == "Telecom":
        recommended_model = "churniq_telecom"
    elif domain == "Banking":
        recommended_model = "churniq_banking"
    elif domain == "Streaming":
        recommended_model = "churniq_streaming"
    elif domain == "Retail":
        recommended_model = "retailiq"

    return {
        "detected_mappings": mappings,
        "confidence_levels": confidence,
        "detected_domain": domain,
        "recommended_model": recommended_model
    }

def validate_uploaded_data(df: pd.DataFrame, id_col: str = None) -> Dict[str, Any]:
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = int(df.isnull().sum().sum())
    missing_pct = round((missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0.0
    
    unique_entities = int(df[id_col].nunique()) if (id_col and id_col in df.columns) else int(len(df))
    duplicate_rows = int(len(df) - unique_entities) if id_col else 0
    
    # Calculate Data Quality Score
    quality_score = 100.0 - min(missing_pct * 1.5, 30.0) - min((duplicate_rows / len(df)) * 50.0, 30.0)
    quality_score = max(15.0, round(quality_score, 1))

    preview = df.head(5).fillna("").to_dict(orient="records")

    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": list(df.columns),
        "unique_entities": unique_entities,
        "duplicate_rows": duplicate_rows,
        "missing_percentage": missing_pct,
        "quality_score": quality_score,
        "preview": preview
    }

def get_demo_customers(domain: str = "saas", limit: int = 25) -> List[Dict[str, Any]]:
    """
    Returns authentic customer records from trained feature stores for Demo Mode.
    """
    file_map = {
        "saas": "churn_features.parquet",
        "telecom": "telecom_features.parquet",
        "banking": "banking_features.parquet",
        "streaming": "streaming_features.parquet"
    }
    filename = file_map.get(domain.lower(), "churn_features.parquet")
    p = os.path.join(PROCESSED_DIR, filename)
    if os.path.exists(p):
        df = pd.read_parquet(p)
        sample = df.head(limit).copy()
        # Drop ground truth target so scoring evaluates it fresh
        target_cols = ["churn_target", "churned", "Exited", "TARGET"]
        for tc in target_cols:
            if tc in sample.columns:
                sample.drop(columns=[tc], inplace=True)
        return sample.to_dict(orient="records")
    return []
