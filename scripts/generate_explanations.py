"""
MLVerse SHAP Explanation Generation & Inspection Script
"""

import os
import json
import joblib

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
MODELS_DIR = os.path.join(PROJECT_DIR, "artifacts", "models")

def inspect_explanations():
    print("Inspecting Top SHAP Drivers across models...")
    for model_name in sorted(os.listdir(MODELS_DIR)):
        shap_file = os.path.join(MODELS_DIR, model_name, "shap_importance.json")
        if os.path.exists(shap_file):
            with open(shap_file) as f:
                drivers = json.load(f)
                top_3 = [f"{d['feature']} ({d['importance']})" for d in drivers[:3]]
                print(f"[{model_name}]: Top Drivers -> {', '.join(top_3)}")

if __name__ == "__main__":
    inspect_explanations()
