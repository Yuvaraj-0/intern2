# Transaction Processing Pipeline

## AI-Powered Financial Transaction Monitoring & Fraud Detection System

![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)
![Celery](https://img.shields.io/badge/Celery-5.3.4-37814A?logo=celery)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-24+-2496ED?logo=docker)
![Ollama](https://img.shields.io/badge/Ollama-TinyLlama-000000)

---

## 📋 Overview

This is a **production-ready transaction processing pipeline** that automatically cleans, analyzes, and detects fraud in financial transaction data. It uses **AI (Ollama/TinyLlama)** to categorize transactions and generate risk assessments.

### Key Features

- ✅ **CSV Upload** - Upload transaction files via REST API or Web UI
- ✅ **Async Processing** - Non-blocking background processing with Celery + Redis
- ✅ **Data Cleaning** - Automatic normalization of dates, amounts, currencies, and statuses
- ✅ **Anomaly Detection** - Flags suspicious transactions (statistical outliers, currency mismatches)
- ✅ **AI Classification** - Uses local LLM (TinyLlama) to categorize uncategorized transactions
- ✅ **Risk Assessment** - Generates risk level (low/medium/high) and spending narrative
- ✅ **Beautiful Dashboard** - React frontend with real-time job monitoring
- ✅ **Docker Containerization** - One-command deployment

---

## 🏗️ Architecture

### Components

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Web Server | FastAPI | 8000 | REST API endpoints |
| Database | PostgreSQL | 5432 | Persistent data storage |
| Message Queue | Redis | 6379 | Task broker for Celery |
| Task Worker | Celery | - | Async transaction processing |
| AI Engine | Ollama (TinyLlama) | 11434 | Local LLM for classification |
| Frontend | React + Vite | 3000 | User dashboard |

### Request Flow

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (v24+)
- 4GB+ RAM (8GB recommended)
- 10GB free disk space

### Installation

```bash
# Clone the repository
git clone https://github.com/Yuvaraj-0/intern2.git
cd intern2

# Start all services
docker-compose up --build


Access the Application
Service	URL
Frontend UI	http://localhost:3000
Backend API	http://localhost:8000
API Documentation	http://localhost:8000/docs