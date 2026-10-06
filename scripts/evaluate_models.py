"""
MLVerse Standalone Evaluation Script
Evaluates all trained model artifacts in artifacts/models against their respective processed test sets.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score, brier_score_loss, log_loss

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
MODELS_DIR = os.path.join(PROJECT_DIR, "artifacts", "models")
PROCESSED_DIR = os.path.join(PROJECT_DIR, "data", "processed")

def evaluate():
    print("Evaluating trained model artifacts...")
    for model_name in os.listdir(MODELS_DIR):
        m_dir = os.path.join(MODELS_DIR, model_name)
        if not os.path.isdir(m_dir):
            continue
        meta_file = os.path.join(m_dir, "model_metadata.json")
        if os.path.exists(meta_file):
            with open(meta_file) as f:
                meta = json.load(f)
                arch = meta.get("architecture", "Unknown")
                metrics = meta.get("test_metrics") or meta.get("metrics")
                print(f"[{model_name.upper()}]: Architecture = {arch}")
                if "roc_auc" in metrics:
                    print(f"  Test ROC-AUC = {metrics['roc_auc']}, PR-AUC = {metrics['pr_auc']}, F1 = {metrics['f1']}, Brier = {metrics['brier_score']}")
                elif "silhouette_score" in metrics:
                    print(f"  Silhouette = {metrics['silhouette_score']}, Davies-Bouldin = {metrics['davies_bouldin_score']}")

if __name__ == "__main__":
    evaluate()
