"""
MLVerse Model Registry Service
Loads trained model artifacts, calibrators, thresholds, and metadata from artifacts/models/
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
MODELS_DIR = os.path.join(PROJECT_DIR, "artifacts", "models")

class ModelRegistry:
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.metadata: Dict[str, Any] = {}
        self.thresholds: Dict[str, Any] = {}
        self.calibrations: Dict[str, Any] = {}
        self.shap_importances: Dict[str, Any] = {}
        self.load_all()

    def load_all(self):
        if not os.path.exists(MODELS_DIR):
            return

        for name in os.listdir(MODELS_DIR):
            m_dir = os.path.join(MODELS_DIR, name)
            if not os.path.isdir(m_dir):
                continue

            joblib_path = os.path.join(m_dir, "model.joblib")
            if os.path.exists(joblib_path):
                try:
                    self.models[name] = joblib.load(joblib_path)
                except Exception as e:
                    print(f"Error loading {name}: {e}")

            # Load JSON metadata
            for attr, filename in [
                ("metadata", "model_metadata.json"),
                ("thresholds", "threshold.json"),
                ("calibrations", "calibration.json"),
                ("shap_importances", "shap_importance.json")
            ]:
                f_path = os.path.join(m_dir, filename)
                if os.path.exists(f_path):
                    with open(f_path, "r", encoding="utf-8") as f:
                        getattr(self, attr)[name] = json.load(f)

        print(f"Model Registry: Successfully loaded {len(self.models)} production model artifacts: {list(self.models.keys())}")

    def get_model(self, name: str):
        return self.models.get(name)

    def get_metadata(self, name: str):
        return self.metadata.get(name, {})

    def get_threshold(self, name: str) -> float:
        th_data = self.thresholds.get(name, {})
        return th_data.get("selected_threshold", 0.50)

    def route_model(self, industry: str, available_cols: list = None) -> str:
        """
        Intelligent Model Routing according to Section 36
        """
        ind = industry.lower() if industry else ""
        if "telecom" in ind or "telco" in ind:
            return "churniq_telecom"
        elif "bank" in ind or "fintech" in ind or "credit" in ind:
            return "churniq_banking"
        elif "streaming" in ind or "media" in ind or "music" in ind or "video" in ind:
            return "churniq_streaming"
        elif "e-commerce" in ind or "ecommerce" in ind or "cart" in ind:
            return "commerceiq"
        elif "retail" in ind or "store" in ind or "pos" in ind:
            return "retailiq"
        elif "loan" in ind or "lending" in ind:
            return "creditriskiq"
        else:
            return "churniq_saas" # Flagship default

registry = ModelRegistry()
