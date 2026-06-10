from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.api import jobs

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Transaction Processing Pipeline")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(jobs.router)

@app.get("/")
def root():
    return {"message": "Transaction Processing API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
