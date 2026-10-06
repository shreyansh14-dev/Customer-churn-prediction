"""
MLVerse Pydantic Schemas for API Validation and Serialization
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Business Onboarding
class BusinessCreate(BaseModel):
    model_config = {"protected_namespaces": ()}
    business_name: str = Field(..., description="Business name for metadata display")
    industry: str = Field("SaaS", description="Industry domain")
    business_model: str = "Subscription"
    country: str = "United States"
    region: str = "North America"
    company_age: str = "1-3 years"
    customer_type: str = "B2B"
    pricing_model: str = "Tiered"
    acquisition_model: str = "Inbound / Self-serve"

class BusinessResponse(BusinessCreate):
    id: int
    created_at: str

# Column Mapping
class ColumnMappingRequest(BaseModel):
    columns: List[str]

class ColumnMappingResponse(BaseModel):
    detected_mappings: Dict[str, str]
    confidence_levels: Dict[str, str]
    detected_domain: str
    recommended_model: str

# Prediction Schemas
class SinglePredictionRequest(BaseModel):
    model_config = {"protected_namespaces": ()}
    customer_id: Optional[str] = "CUST-PREVIEW-01"
    features: Dict[str, Any]
    model_override: Optional[str] = None

class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    customer_id: str
    probability: float
    risk_level: str
    predicted_label: int
    threshold: float
    top_risk_factors: List[Dict[str, Any]]
    protective_factors: List[Dict[str, Any]]
    recommended_action: str
    model_version: str
    architecture: str
    prediction_timestamp: str

class BatchPredictionRequest(BaseModel):
    model_config = {"protected_namespaces": ()}
    model_name: Optional[str] = "churniq_saas"
    customers: List[Dict[str, Any]]

class BatchPredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    model_name: str
    model_version: str
    total_processed: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    critical_risk_count: int
    avg_probability: float
    revenue_exposure: float
    results: List[PredictionResponse]

# Health & Recommendations
class BusinessHealthResponse(BaseModel):
    business_health_score: float
    retention_health: float
    engagement_health: float
    revenue_stability: float
    payment_health: float
    customer_loyalty: float
    revenue_exposure: float
    high_risk_percentage: float
    recommended_actions: List[Dict[str, Any]]
    score_definitions: Dict[str, str]

# RFM Segmentation
class SegmentRequest(BaseModel):
    customers: List[Dict[str, Any]]

class SegmentResponse(BaseModel):
    total_customers: int
    silhouette_score: float
    segments: Dict[str, int]
    results: List[Dict[str, Any]]
