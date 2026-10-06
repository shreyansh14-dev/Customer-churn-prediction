import os
import json
import pytest
from backend.services.model_registry import registry
from backend.services.scoring_engine import score_customer
from backend.services.health_engine import compute_business_health

def test_all_models_loaded():
    expected = [
        "churniq_saas", "churniq_telecom", "churniq_banking",
        "churniq_streaming", "commerceiq", "retailiq", "creditriskiq"
    ]
    for m in expected:
        assert m in registry.models, f"Model {m} must be loaded in registry"

def test_model_metrics_truthfulness():
    for name in registry.models.keys():
        meta = registry.metadata.get(name, {})
        metrics = meta.get("test_metrics") or meta.get("metrics")
        assert metrics is not None, f"Model {name} must have genuine test metrics"
        if "roc_auc" in metrics:
            assert 0.50 <= metrics["roc_auc"] <= 1.0, f"ROC-AUC {metrics['roc_auc']} out of range"
        if "brier_score" in metrics:
            assert 0.0 <= metrics["brier_score"] <= 1.0, f"Brier score {metrics['brier_score']} out of range"

def test_scoring_engine_saas():
    sample = {
        "tenure": 12,
        "mrr": 250.0,
        "sessions_last_month": 45,
        "feature_usage_score": 75.0,
        "support_tickets_total": 1,
        "payment_failures_total": 0,
        "activity_trend": 0.25
    }
    result = score_customer("churniq_saas", sample, customer_id="TEST-SAAS-001")
    assert result["customer_id"] == "TEST-SAAS-001"
    assert 0.0 <= result["probability"] <= 1.0
    assert result["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert len(result["protective_factors"]) > 0 or len(result["top_risk_factors"]) > 0

def test_business_health_engine():
    sample_scored = [
        {"customer_id": "C1", "probability": 0.10, "risk_level": "LOW", "arr": 1200},
        {"customer_id": "C2", "probability": 0.85, "risk_level": "CRITICAL", "arr": 2400},
        {"customer_id": "C3", "probability": 0.35, "risk_level": "MEDIUM", "arr": 1500}
    ]
    health = compute_business_health(sample_scored, sample_scored)
    assert 0.0 <= health["business_health_score"] <= 100.0
    assert health["revenue_exposure"] == 2400.0
    assert len(health["recommended_actions"]) > 0
