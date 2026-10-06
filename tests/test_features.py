import os
import pandas as pd
import pytest

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
PROCESSED_DIR = os.path.join(PROJECT_DIR, "data", "processed")

def test_churn_features_parquet():
    p = os.path.join(PROCESSED_DIR, "churn_features.parquet")
    assert os.path.exists(p), "churn_features.parquet must exist"
    df = pd.read_parquet(p)
    assert len(df) == 5000
    assert "churn_target" in df.columns
    assert "customer_id" in df.columns
    assert "tenure" in df.columns
    assert "activity_trend" in df.columns
    assert "payment_health" in df.columns

def test_telecom_features_parquet():
    p = os.path.join(PROCESSED_DIR, "telecom_features.parquet")
    assert os.path.exists(p)
    df = pd.read_parquet(p)
    assert len(df) == 7043
    assert "churn_target" in df.columns

def test_commerce_features_parquet():
    p = os.path.join(PROCESSED_DIR, "commerce_features.parquet")
    assert os.path.exists(p)
    df = pd.read_parquet(p)
    assert len(df) > 10000
    assert "purchase_target" in df.columns

def test_retail_features_parquet():
    p = os.path.join(PROCESSED_DIR, "retail_features.parquet")
    assert os.path.exists(p)
    df = pd.read_parquet(p)
    assert "recency" in df.columns
    assert "frequency" in df.columns
    assert "monetary_value" in df.columns
