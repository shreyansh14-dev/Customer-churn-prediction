"""
MLVerse Calibration Verification & Inspection Script
Inspects probability calibration curves, Brier scores, and calibration gains for all trained models.
"""

import os
import json

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
MODELS_DIR = os.path.join(PROJECT_DIR, "artifacts", "models")

def verify_calibration():
    print("Verifying probability calibration results across all models...")
    for model_name in sorted(os.listdir(MODELS_DIR)):
        cal_path = os.path.join(MODELS_DIR, model_name, "calibration.json")
        if os.path.exists(cal_path):
            with open(cal_path) as f:
                cal = json.load(f)
                uncal_brier = cal.get("uncalibrated_brier")
                cal_brier = cal.get("calibrated_brier")
                gain = round(((uncal_brier - cal_brier) / uncal_brier) * 100, 2) if uncal_brier else 0.0
                print(f"[{model_name}]: Uncalibrated Brier = {uncal_brier} -> Calibrated Brier = {cal_brier} (Gain: {gain}%)")

if __name__ == "__main__":
    verify_calibration()
