from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    status = Column(String, default="pending")
    row_count_raw = Column(Integer, default=0)
    row_count_clean = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, nullable=False)
    txn_id = Column(String, nullable=True)  # This is TEXT, not number
    date = Column(String, nullable=True)
    merchant = Column(String, nullable=True)
    amount = Column(Float, nullable=True)  # This is the number column
    currency = Column(String, nullable=True)
    status = Column(String, nullable=True)
    category = Column(String, default="Uncategorised")
    account_id = Column(String, nullable=True)
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(Text, nullable=True)
    llm_category = Column(String, nullable=True)
    llm_raw_response = Column(Text, nullable=True)
    llm_failed = Column(Boolean, default=False)

class JobSummary(Base):
    __tablename__ = "job_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, nullable=False, unique=True)
    total_spend_usd = Column(Float, default=0)
    total_spend_inr = Column(Float, default=0)
    top_merchants = Column(JSON, default=list)
    anomaly_count = Column(Integer, default=0)
    narrative = Column(Text, default="")
    risk_level = Column(String, default="low")
