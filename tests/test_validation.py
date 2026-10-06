import os
import json
import pytest

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
REPORTS_DIR = os.path.join(PROJECT_DIR, "artifacts", "reports")

def test_data_quality_report():
    quality_path = os.path.join(REPORTS_DIR, "data_quality_report.json")
    assert os.path.exists(quality_path), "data_quality_report.json must exist"
    with open(quality_path) as f:
        rep = json.load(f)
    assert "telecom_churn" in rep
    assert rep["telecom_churn"]["quality"]["score"] >= 70.0

def test_leakage_report():
    leakage_path = os.path.join(REPORTS_DIR, "leakage_report.json")
    assert os.path.exists(leakage_path), "leakage_report.json must exist"
    with open(leakage_path) as f:
        rep = json.load(f)
    assert "Flagship_SaaS_ChurnIQ" in rep
    assert rep["Flagship_SaaS_ChurnIQ"]["status"] == "PASSED"
    assert len(rep["Flagship_SaaS_ChurnIQ"]["high_correlation_features"]) == 0
