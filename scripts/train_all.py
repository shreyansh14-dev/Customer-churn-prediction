"""
MLVerse Master Training Pipeline
Runs discovery -> validation -> feature engineering -> training -> evaluation -> calibration -> explainability.
"""

import subprocess
import sys
import os

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"

scripts = [
    "discover_datasets.py",
    "validate_datasets.py",
    "build_features.py",
    "train_models.py",
    "evaluate_models.py",
    "calibrate_models.py",
    "generate_explanations.py"
]

def main():
    print("==================================================================")
    print("      MLVerse END-TO-END PIPELINE ORCHESTRATION                   ")
    print("==================================================================")
    for s in scripts:
        script_path = os.path.join(PROJECT_DIR, "scripts", s)
        print(f"\n>>> Running {s}...")
        res = subprocess.run([sys.executable, script_path], cwd=PROJECT_DIR)
        if res.returncode != 0:
            print(f"ERROR: {s} failed with return code {res.returncode}")
            sys.exit(res.returncode)
    print("\n==================================================================")
    print("      MLVerse PIPELINE EXECUTION COMPLETED SUCCESSFULLY!          ")
    print("==================================================================")

if __name__ == "__main__":
    main()
