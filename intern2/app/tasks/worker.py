from celery import Celery
import os
import pandas as pd
import io
import math
from sqlalchemy.sql import func

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery("worker", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
)

def fix_nan(value):
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if isinstance(value, str) and value.lower() == 'nan':
        return None
    return value

@celery_app.task
def process_csv_task(job_id: int, csv_content: str):
    print(f"\n{'='*50}")
    print(f"Processing Job {job_id}")
    print(f"{'='*50}")
    
    from app.database import SessionLocal
    from app.models import Job, Transaction, JobSummary
    from app.services.cleaner import clean_dataframe
    from app.services.anomaly_detector import detect_anomalies
    from app.services.llm_classifier import batch_classify_categories, generate_summary
    
    db = SessionLocal()
    job = None
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}
        
        job.status = "processing"
        db.commit()
        print(f"Job {job_id}: Processing started")
        
        # Read CSV
        df = pd.read_csv(io.StringIO(csv_content))
        print(f"Read {len(df)} rows")
        
        # 1. Clean data
        df_clean = clean_dataframe(df)
        print(f"After cleaning: {len(df_clean)} rows")
        
        # 2. Detect anomalies
        df_clean = detect_anomalies(df_clean)
        
        # 3. Classify uncategorized with LLM
        uncategorized = df_clean[df_clean['category'] == 'Uncategorised']
        if len(uncategorized) > 0:
            categories = batch_classify_categories(uncategorized)
            for idx, cat in categories.items():
                df_clean.at[idx, 'category'] = cat
                df_clean.at[idx, 'llm_category'] = cat
        
        # 4. Generate summary with LLM
        transactions_list = df_clean.to_dict('records')
        summary_data = generate_summary(transactions_list)
        
        # 5. Save transactions
        saved = 0
        for _, row in df_clean.iterrows():
            transaction = Transaction(
                job_id=job_id,
                txn_id=fix_nan(row.get('txn_id')),
                date=str(row.get('date')) if row.get('date') else None,
                merchant=str(row.get('merchant')) if row.get('merchant') else None,
                amount=float(row.get('amount', 0)),
                currency=str(row.get('currency', 'INR')),
                status=str(row.get('status', 'PENDING')),
                category=str(row.get('category', 'Uncategorised')),
                account_id=fix_nan(row.get('account_id')),
                is_anomaly=bool(row.get('is_anomaly', False)),
                anomaly_reason=fix_nan(row.get('anomaly_reason')),
                llm_category=fix_nan(row.get('llm_category'))
            )
            db.add(transaction)
            saved += 1
        db.commit()
        print(f"Saved {saved} transactions")
        
        # 6. Save summary
        total_usd = df_clean[df_clean['currency'] == 'USD']['amount'].sum() if 'currency' in df_clean else 0
        total_inr = df_clean[df_clean['currency'] == 'INR']['amount'].sum() if 'currency' in df_clean else 0
        
        job_summary = JobSummary(
            job_id=job_id,
            total_spend_usd=float(total_usd),
            total_spend_inr=float(total_inr),
            anomaly_count=int(df_clean['is_anomaly'].sum()),
            narrative=summary_data.get('narrative', ''),
            risk_level=summary_data.get('risk_level', 'low')
        )
        db.add(job_summary)
        
        # Update job
        job.status = "completed"
        job.row_count_clean = len(df_clean)
        job.completed_at = func.now()
        db.commit()
        
        print(f"\n✅ Job {job_id} COMPLETED!")
        print(f"   Total: {len(df_clean)} transactions")
        print(f"   Anomalies: {df_clean['is_anomaly'].sum()}")
        print(f"   Risk: {summary_data.get('risk_level', 'unknown')}")
        
    except Exception as e:
        print(f"❌ Job {job_id} FAILED: {e}")
        import traceback
        traceback.print_exc()
        if job:
            try:
                job.status = "failed"
                job.error_message = str(e)
                db.commit()
            except:
                pass
    finally:
        db.close()
    
    return {"status": "completed", "job_id": job_id}
