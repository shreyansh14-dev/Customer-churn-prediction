import os
import json
import pytest

PROJECT_DIR = r"D:\customer churn prediction\MLVerse"
REPORTS_DIR = os.path.join(PROJECT_DIR, "artifacts", "reports")

def test_dataset_inventory_exists():
    json_path = os.path.join(REPORTS_DIR, "dataset_inventory.json")
    assert os.path.exists(json_path), "dataset_inventory.json must exist"
    with open(json_path, "r", encoding="utf-8") as f:
        inventory = json.load(f)
    assert len(inventory) >= 5, f"Expected at least 5 discovered datasets, found {len(inventory)}"

def test_inventory_contains_expected_datasets():
    json_path = os.path.join(REPORTS_DIR, "dataset_inventory.json")
    with open(json_path, "r", encoding="utf-8") as f:
        inventory = json.load(f)
    names = [item["dataset_name"] for item in inventory]
    assert any("dataset.csv" in n for n in names)
    assert any("users.parquet" in n for n in names)
    assert any("bank" in n.lower() for n in names)
    assert any("streaming" in n.lower() for n in names)
