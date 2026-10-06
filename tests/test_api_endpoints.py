import pytest
from starlette.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["loaded_models_count"] >= 7

def test_api_projects():
    res = client.get("/api/projects")
    assert res.status_code == 200
    data = res.json()
    assert data["flagship"] == "ChurnIQ"
    assert len(data["projects"]) >= 4

def test_api_predict_churn():
    payload = {
        "customer_id": "TEST-API-99",
        "features": {
            "tenure": 14,
            "mrr": 300.0,
            "sessions_last_month": 40,
            "feature_usage_score": 80.0,
            "support_tickets_total": 0,
            "payment_failures_total": 0
        }
    }
    res = client.post("/api/predict/churn", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["customer_id"] == "TEST-API-99"
    assert "probability" in data
    assert "risk_level" in data
    assert "recommended_action" in data

def test_api_predict_batch():
    payload = {
        "model_name": "churniq_saas",
        "customers": [
            {"customer_id": "C1", "tenure": 10, "mrr": 100, "sessions_last_month": 20},
            {"customer_id": "C2", "tenure": 2, "mrr": 400, "sessions_last_month": 3, "payment_failures_total": 2}
        ]
    }
    res = client.post("/api/predict-batch", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_processed"] == 2
    assert len(data["results"]) == 2

def test_api_mapping_detect():
    payload = {
        "columns": ["user_id", "monthly_charges", "tenure_months", "logins", "tickets"]
    }
    res = client.post("/api/mapping/detect", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "customer_id" in data["detected_mappings"].values()
    assert "mrr" in data["detected_mappings"].values()
