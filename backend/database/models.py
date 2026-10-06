"""
MLVerse SQLAlchemy Models
Stores business profiles, analysis runs, and audit logs.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database.session import Base

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False)
    business_model = Column(String(100), default="Subscription")
    country = Column(String(100), default="Global")
    region = Column(String(100), default="North America")
    company_age = Column(String(50), default="1-3 years")
    customer_type = Column(String(50), default="B2B")
    pricing_model = Column(String(50), default="Tiered")
    acquisition_model = Column(String(50), default="Inbound / Self-serve")
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("AnalysisRun", back_populates="business")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_profiles.id"), nullable=True)
    dataset_name = Column(String(255), nullable=False)
    model_name = Column(String(100), nullable=False)
    total_customers = Column(Integer, default=0)
    high_risk_customers = Column(Integer, default=0)
    avg_churn_probability = Column(Float, default=0.0)
    revenue_exposure = Column(Float, default=0.0)
    business_health_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    summary_metrics = Column(JSON, nullable=True)

    business = relationship("BusinessProfile", back_populates="analyses")
