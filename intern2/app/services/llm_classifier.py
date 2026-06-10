import os
import json
import requests
from tenacity import retry, stop_after_attempt, wait_exponential

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

CATEGORIES = ['Food', 'Shopping', 'Travel', 'Transport', 'Utilities', 'Cash Withdrawal', 'Entertainment', 'Other']

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_ollama(prompt):
    """Call Ollama API with retry logic"""
    url = f"{OLLAMA_URL}/api/generate"
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 500
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "").strip()
    except Exception as e:
        print(f"Ollama API error: {e}")
        raise

def batch_classify_categories(df_uncategorized):
    """Batch classify transactions using Ollama"""
    if len(df_uncategorized) == 0:
        print("No uncategorized transactions to classify")
        return {}
    
    print(f"Classifying {len(df_uncategorized)} transactions with Ollama...")
    
    transactions_list = df_uncategorized.to_dict('records')
    categories_map = {}
    
    # Process in batches of 10 to avoid token limits
    batch_size = 10
    for i in range(0, len(transactions_list), batch_size):
        batch = transactions_list[i:i+batch_size]
        
        # Build prompt
        transaction_texts = []
        for idx, txn in enumerate(batch):
            text = f"Transaction {idx}: Merchant='{txn.get('merchant', 'Unknown')}', Amount={txn.get('amount', 0)} {txn.get('currency', 'INR')}"
            if txn.get('notes'):
                text += f", Notes='{txn['notes']}'"
            transaction_texts.append(text)
        
        prompt = f"""You are a financial categorizer. Classify each transaction into ONE category from: {', '.join(CATEGORIES)}.

Transactions:
{chr(10).join(transaction_texts)}

Return ONLY JSON: {{"0": "category", "1": "category", ...}}"""

        try:
            response = call_ollama(prompt)
            # Clean response
            response = response.replace('```json', '').replace('```', '').strip()
            batch_results = json.loads(response)
            
            # Map back
            for idx, cat in batch_results.items():
                original_idx = df_uncategorized.index[i + int(idx)]
                categories_map[original_idx] = cat
                
        except Exception as e:
            print(f"Batch {i} failed: {e}")
            # Default category
            for idx, txn in enumerate(batch):
                original_idx = df_uncategorized.index[i + idx]
                categories_map[original_idx] = "Other"
    
    print(f"Classified {len(categories_map)} transactions")
    return categories_map

def generate_summary(transactions):
    """Generate narrative summary using Ollama"""
    if not transactions:
        return {"narrative": "No transactions to analyze", "risk_level": "low"}
    
    print("Generating summary with Ollama...")
    
    # Calculate statistics
    total_spend = sum(t.get('amount', 0) for t in transactions)
    anomaly_count = sum(1 for t in transactions if t.get('is_anomaly', False))
    unique_merchants = len(set(t.get('merchant', '') for t in transactions))
    
    # Get top merchants
    merchant_spend = {}
    for t in transactions:
        merchant = t.get('merchant', 'Unknown')
        merchant_spend[merchant] = merchant_spend.get(merchant, 0) + t.get('amount', 0)
    top_merchants = sorted(merchant_spend.items(), key=lambda x: x[1], reverse=True)[:3]
    
    prompt = f"""Analyze these transaction statistics and return JSON:

Total Transactions: {len(transactions)}
Total Spend: {total_spend:.2f}
Anomalies Found: {anomaly_count}
Unique Merchants: {unique_merchants}
Top Merchants: {', '.join([f"{m}({amt:.0f})" for m, amt in top_merchants])}

Return: {{"narrative": "2-3 sentence analysis", "risk_level": "low/medium/high"}}"""

    try:
        response = call_ollama(prompt)
        response = response.replace('```json', '').replace('```', '').strip()
        return json.loads(response)
    except Exception as e:
        print(f"Summary failed: {e}")
        risk = "high" if anomaly_count > 5 else "medium" if anomaly_count > 2 else "low"
        return {
            "narrative": f"Processed {len(transactions)} transactions totaling {total_spend:.2f}. Found {anomaly_count} anomalies.",
            "risk_level": risk
        }
