from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Job, Transaction, JobSummary
from app.tasks.worker import process_csv_task
import pandas as pd
import io

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, "Only CSV files allowed")
    
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode('utf-8')))
    
    job = Job(
        filename=file.filename,
        status="pending",
        row_count_raw=len(df)
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    process_csv_task.delay(job.id, content.decode('utf-8'))
    
    return {"job_id": job.id}

@router.get("/{job_id}/status")
def get_status(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return {
        "job_id": job.id,
        "status": job.status,
        "filename": job.filename,
        "row_count_raw": job.row_count_raw,
        "row_count_clean": job.row_count_clean,
        "created_at": str(job.created_at),
        "completed_at": str(job.completed_at) if job.completed_at else None,
        "error_message": job.error_message
    }

@router.get("/{job_id}/results")
def get_results(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    
    if job.status != "completed":
        raise HTTPException(400, f"Job not completed. Status: {job.status}")
    
    # Get transactions
    transactions = db.query(Transaction).filter(Transaction.job_id == job_id).all()
    
    # Get summary
    summary = db.query(JobSummary).filter(JobSummary.job_id == job_id).first()
    
    # Build category breakdown
    category_breakdown = {}
    for t in transactions:
        cat = t.llm_category or t.category
        category_breakdown[cat] = category_breakdown.get(cat, 0) + 1
    
    # Get anomalies
    anomalies = [t for t in transactions if t.is_anomaly]
    
    return {
        "job_id": job.id,
        "status": job.status,
        "cleaned_transactions": [
            {
                "txn_id": t.txn_id,
                "date": t.date,
                "merchant": t.merchant,
                "amount": t.amount,
                "currency": t.currency,
                "status": t.status,
                "category": t.llm_category or t.category,
                "is_anomaly": t.is_anomaly,
                "anomaly_reason": t.anomaly_reason
            }
            for t in transactions[:10]  # Show first 10 only
        ],
        "total_transactions": len(transactions),
        "flagged_anomalies": [
            {
                "txn_id": a.txn_id,
                "merchant": a.merchant,
                "amount": a.amount,
                "reason": a.anomaly_reason
            }
            for a in anomalies
        ],
        "anomaly_count": len(anomalies),
        "category_breakdown": category_breakdown,
        "llm_narrative": {
            "narrative": summary.narrative if summary else "",
            "risk_level": summary.risk_level if summary else "unknown",
            "recommendations": "Review flagged anomalies" if summary and summary.anomaly_count > 0 else "No action needed"
        } if summary else {}
    }

@router.get("/")
def list_jobs(
    status: Optional[str] = Query(None),
    limit: int = Query(100),
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    jobs = query.order_by(Job.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": job.id,
            "filename": job.filename,
            "status": job.status,
            "row_count_raw": job.row_count_raw,
            "row_count_clean": job.row_count_clean,
            "created_at": str(job.created_at),
            "completed_at": str(job.completed_at) if job.completed_at else None
        }
        for job in jobs
    ]
