import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/transaction_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Ollama Configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

# Domestic brands for anomaly detection
DOMESTIC_BRANDS = {"swiggy", "ola", "irctc", "zomato", "bigbasket", "flipkart", "amazon.in"}