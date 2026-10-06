# MLVerse / ChurnIQ: Enterprise AI/ML Customer Intelligence & Risk SaaS Platform
### *Predict. Explain. Retain.*

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![DuckDB](https://img.shields.io/badge/DuckDB-0.10-FFF000.svg)](https://duckdb.org/)
[![Polars](https://img.shields.io/badge/Polars-0.20-CD792C.svg)](https://pola.rs/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5-F7931E.svg)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-EB4034.svg)](https://xgboost.ai/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.3-2ECC71.svg)](https://lightgbm.readthedocs.io/)
[![Optuna](https://img.shields.io/badge/Optuna-3.6-1E88E5.svg)](https://optuna.org/)
[![SHAP](https://img.shields.io/badge/SHAP-0.45-FF6F00.svg)](https://shap.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

**MLVerse** is a production-grade, enterprise AI/ML Intelligence and Customer Retention SaaS platform. It bridges advanced predictive modeling (Optuna-tuned LightGBM, XGBoost, Random Forest) with localized TreeExplainer SHAP explainability and interactive Bloomberg-grade executive dashboards.

---

## 1. Flagship Modules & Product Lineup

MLVerse addresses the fundamental challenge faced by subscription businesses, retailers, and lenders: **detecting customer attrition and risk before revenue loss occurs.**

| Product Module | Target Problem | Model Algorithm | Best Metric | Explainability |
| :--- | :--- | :--- | :--- | :--- |
| **ChurnIQ SaaS** | B2B SaaS Recurring Churn | Random Forest + Optuna | **ROC-AUC: 0.8483** | TreeExplainer SHAP |
| **ChurnIQ Telecom** | Broadband & Carrier Churn | Calibrated Logistic Regression | **ROC-AUC: 0.8458** | LinearExplainer |
| **ChurnIQ Banking** | Retail Bank Account Attrition | LightGBM Classifier | **ROC-AUC: 0.9235** | TreeExplainer SHAP |
| **ChurnIQ Streaming**| Media Subscription Retention | XGBoost Classifier | **ROC-AUC: 0.8741** | TreeExplainer SHAP |
| **CommerceIQ** | Cart Abandonment & Intent | Regularized Logistic Regression | **ROC-AUC: 0.7277** | Feature Attributions |
| **RetailIQ** | RFM Segmentation & CLV | Unsupervised K-Means ($k=4$) | **Silhouette: 0.3398** | Centroid Centers |
| **CreditRiskIQ** | Loan Underwriting Default Risk| Random Forest + Platt Scaling | **ROC-AUC: 0.7392** | TreeExplainer SHAP |

---

## 2. Platform Architecture & Data Flow

```
[ Customer Data (CSV/Parquet) ]
              │
              ▼
    [ Smart Column Mapper ] (15 Canonical Features Auto-Detected)
              │
              ▼
    [ Automated Leakage Detector ] (Target correlation & temporal split audits)
              │
              ▼
    [ Feature Store Engine ] (Polars / DuckDB high-throughput transformations)
              │
              ├────────────────────────────────────────┐
              ▼                                        ▼
    [ 7 Pre-Trained Production Models ]      [ Real-Time SHAP Explainer ]
              │                                        │
              ▼                                        ▼
    [ FastAPI Inference Microservice ] ◄───────┘
              │ (Sub-30ms p99 REST Endpoints)
              ▼
    [ React 18 + Vite + GSAP Dashboard ]
       - 13-Step Business Analysis Engine
       - ChurnIQ Bloomberg-grade Terminal
       - Executive Audit PDF/JSON Exporter
```

---

## 3. Discovered Datasets & Processing Strategy

All raw source datasets are processed with strict temporal isolation and automated deduplication:

| Dataset Name | Domain | Rows Processed | Processing Strategy | Assigned Model | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SaaS Customer Churn** | B2B SaaS | ~5,000 | DuckDB vectorized extraction | `churniq_saas` | **Deployed** |
| **Telecom Churn** | Telecom | 7,043 | Polars one-hot encoding & scaling | `churniq_telecom` | **Deployed** |
| **Banking Customer Churn** | Banking | 10,000+ | Group-aware customer deduplication | `churniq_banking` | **Deployed** |
| **Streaming Subscription** | Media | 125,000 | PyArrow streaming chunk scanner | `churniq_streaming` | **Deployed** |
| **eCommerce Clickstream** | eCommerce | 500,000+ | DuckDB session aggregation | `commerceiq` | **Deployed** |
| **Online Retail II** | Retail | 100,000 | RFM lifetime value feature matrix | `retailiq` | **Deployed** |
| **Home Credit Default Risk** | Lending | 50,000 | Relational financial ratio builder | `creditriskiq` | **Deployed** |

---

## 4. Truthful Model Performance & Evaluation Matrix

Metrics are evaluated on untouched, out-of-sample holdout test sets:

| Model ID | Algorithm | Test ROC-AUC | Test PR-AUC | Test F1 Score | Optimal Threshold | Brier Score | Calibration | SHAP Explainer |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `churniq_saas` | Random Forest | **0.8483** | **0.7447** | **0.7492** | 0.6700 | 0.1133 | Sigmoid (Platt) | TreeExplainer |
| `churniq_telecom`| Logistic Regression | **0.8458** | **0.6606** | **0.6385** | 0.3400 | 0.1342 | Standard | LinearExplainer |
| `churniq_banking`| LightGBM | **0.9235** | **0.8259** | **0.7516** | 0.5700 | 0.0818 | Calibrated | TreeExplainer |
| `churniq_streaming`| XGBoost | **0.8741** | **0.8850** | **0.8523** | 0.3500 | 0.1417 | Calibrated | TreeExplainer |
| `commerceiq` | Logistic Regression | **0.7277** | **0.0571** | **0.1384** | 0.0700 | 0.0210 | Standard | LinearExplainer |
| `retailiq` | K-Means ($k=4$) | *N/A* | *N/A* | *Silhouette: 0.3398* | *Calinski: 848.05* | *N/A* | *N/A* | Feature Centers |
| `creditriskiq` | Random Forest | **0.7392** | **0.2117** | **0.3015** | 0.1500 | 0.0706 | Sigmoid | TreeExplainer |

---

## 5. Automated Data Leakage Prevention Engine

The automated leakage detector in `ml/validation/leakage_detector.py` enforces:
1. **Target Correlation**: Rejects features with $|r| > 0.95$ with target.
2. **Post-Event Contamination Audit**: Automatically strips post-cancellation reasons and retrospective survey responses from predictor matrices.
3. **Temporal Split Enforcement**: Prevents look-ahead bias across transaction windows.
4. **Group Contamination Defense**: Asserts zero overlap in `customer_id` / `account_id` between training and validation folds.

---

## 6. Deployment Guide

### Option A: Single Container Docker Deployment (Recommended)

MLVerse includes a production-ready multi-stage [Dockerfile](file:///D:/customer%20churn%20prediction/MLVerse/Dockerfile) that builds the React frontend and serves both the REST API and the UI through FastAPI:

```bash
# 1. Build Docker image
docker build -t mlverse:latest .

# 2. Run container
docker run -d -p 8000:8000 --name mlverse-app mlverse:latest
```
Access the application at: `http://localhost:8000/` (UI) and `http://localhost:8000/docs` (Swagger API).

Or using Docker Compose:
```bash
docker compose up --build -d
```

---

### Option B: Cloud Deployment (Render / Railway / Fly.io / AWS)

#### Deploy to Render:
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository: `https://github.com/Shreyansh1528/Customer-churn-prediction-model`.
3. Select **Docker** as the Runtime environment.
4. Set the Port environment variable:
   - `PORT`: `8000`
5. Click **Create Web Service**. Render will automatically build the multi-stage Dockerfile and host the application with automated HTTPS.

#### Deploy to Railway:
1. Create a **New Project** on [Railway](https://railway.app).
2. Select **Deploy from GitHub repo** and pick `Customer-churn-prediction-model`.
3. Railway automatically detects the root `Dockerfile` and deploys both the backend and frontend.

#### Deploy to Vercel (Frontend Only) + FastAPI Backend:
1. **Backend**: Deploy the root Docker container to Render/Railway or AWS ECS.
2. **Frontend**: Deploy the `frontend/` subdirectory to Vercel:
   ```bash
   cd frontend
   npm install -g vercel
   vercel --prod
   ```
3. Set `VITE_API_BASE_URL` in Vercel to your deployed backend URL (e.g. `https://your-api.onrender.com`).

---

### Option C: Local Development Setup

#### 1. Python Backend Setup:
```bash
# 1. Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 3. Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. React + TypeScript Frontend Setup:
```bash
# In a second terminal:
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 7. REST API Documentation

The FastAPI backend exposes OpenAPI 3.1 Swagger endpoints at `/docs`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and loaded model inventory |
| `GET` | `/api/models` | List all trained production models and metrics |
| `GET` | `/api/models/{id}` | Model hyperparameters, optimal threshold, and SHAP drivers |
| `GET` | `/api/customers` | Customer risk queue with filtering and search |
| `POST` | `/api/predict/churn` | Real-time single-customer scoring with SHAP waterfall |
| `POST` | `/api/predict-batch` | High-throughput cohort scoring for uploaded CSV/Parquet |
| `POST` | `/api/upload/detect-mapping` | Automatic smart column mapping for 15 canonical features |
| `POST` | `/api/upload` | Upload customer cohort file for validation & analysis |
| `GET` | `/api/business-health` | Executive business health scores and MRR exposure |
| `POST` | `/api/segment` | Unsupervised RFM segmentation ($k$-Means) |

### Sample Inference Request (`POST /api/predict/churn`):
```json
{
  "model_id": "churniq_saas",
  "features": {
    "tenure_months": 8,
    "monthly_charges": 120.0,
    "support_tickets_last_30d": 4,
    "usage_frequency_score": 0.32,
    "contract_type": "Monthly",
    "payment_failure_count": 2
  }
}
```

### Sample Inference Response:
```json
{
  "churn_probability": 0.742,
  "risk_tier": "HIGH",
  "prediction": 1,
  "threshold_used": 0.670,
  "shap_drivers": [
    { "feature": "payment_failure_count", "impact": "+0.284" },
    { "feature": "support_tickets_last_30d", "impact": "+0.198" },
    { "feature": "tenure_months", "impact": "+0.142" }
  ],
  "latency_ms": 18.2
}
```

---

## 8. Automated Test Suite

Run full system tests (data discovery, validation audits, ML training pipelines, and API endpoints):
```bash
pytest -v
```

---

## 9. Repository Structure

```
MLVerse/
├── backend/                  # FastAPI microservice
│   ├── main.py               # Application entrypoint & routes
│   ├── models/               # Pydantic schemas & state models
│   ├── routes/               # API endpoint routers
│   └── services/             # Model inference & data services
├── frontend/                 # React 18 + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/       # Wizards, Dashboards, Atmosphere
│   │   ├── App.tsx           # Application shell & route motion
│   │   └── index.css         # Typography & design tokens
│   ├── package.json
│   └── vite.config.ts
├── ml/                       # Machine Learning Engineering
│   ├── feature_engineering/  # Feature transformations
│   ├── models/               # Model trainers (LightGBM, XGBoost, RF)
│   ├── validation/           # Leakage detection & Optuna tuning
│   └── explainability/       # TreeExplainer & SHAP attribution
├── artifacts/                # Trained model weights & reports
│   ├── models/               # 7 production .joblib models
│   ├── reports/              # Metrics & leakage audit JSONs
│   └── shap/                 # SHAP TreeExplainers
├── data/                     # Data stores
│   └── processed/            # Parquet feature stores
├── configs/                  # Model & dataset YAML definitions
├── scripts/                  # Automated pipelines (train_all.py, etc.)
├── tests/                    # Pytest test cases
├── Dockerfile                # Production multi-stage Docker build
├── docker-compose.yml        # Multi-container orchestration
├── requirements.txt          # Python runtime dependencies
└── README.md                 # Complete platform documentation
```

---

## 10. Responsible AI Notice

> **IMPORTANT REGULATORY NOTICE**:
> CreditRiskIQ and financial default estimation modules are analytical approximations created for demonstration and enterprise portfolio evaluation. They do **NOT** constitute automated credit underwriting decision systems under Fair Credit Reporting Act (FCRA), Equal Credit Opportunity Act (ECOA), or GDPR Article 22 provisions.
