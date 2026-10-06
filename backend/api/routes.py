"""
MLVerse FastAPI REST API Endpoints
"""

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
    try:
        if file.filename.endswith(".parquet"):
            df = pd.read_parquet(io.BytesIO(contents))
        elif file.filename.endswith((".csv", ".txt")):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Upload CSV, Parquet, or XLSX.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    validation = validate_uploaded_data(df)
    mapping = detect_column_mappings(list(df.columns))
    
    return {
        "filename": file.filename,
        "validation": validation,
        "mapping": mapping
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
    model_name = payload.model_name or "churniq_saas"
    scored_list = []
    
    for idx, c in enumerate(payload.customers):
        c_id = c.get("customer_id", c.get("CustomerID", c.get("user_id", f"CUST-{idx+1:04d}")))
        scored = score_customer(model_name, c, customer_id=str(c_id))
        scored_list.append(scored)

    total = len(scored_list)
    high_count = sum(1 for s in scored_list if s["risk_level"] == "HIGH")
    med_count = sum(1 for s in scored_list if s["risk_level"] == "MEDIUM")
    low_count = sum(1 for s in scored_list if s["risk_level"] == "LOW")
    crit_count = sum(1 for s in scored_list if s["risk_level"] == "CRITICAL")
    avg_p = float(np.mean([s["probability"] for s in scored_list])) if total > 0 else 0.0

    # Calculate revenue exposure
    exposure = sum(
        float(payload.customers[i].get("arr", payload.customers[i].get("customer_value", payload.customers[i].get("mrr", 120.0))))
        for i, s in enumerate(scored_list)
        if s["risk_level"] in ["HIGH", "CRITICAL"]
    )

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
    model_name = payload.model_name or "churniq_saas"
    scored_list = []
    for idx, c in enumerate(payload.customers):
        c_id = c.get("customer_id", c.get("user_id", f"CUST-{idx+1:04d}"))
        scored = score_customer(model_name, c, customer_id=str(c_id))
        scored_list.append(scored)

    health = compute_business_health(scored_list, payload.customers)
    return health
