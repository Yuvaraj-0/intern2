import requests
import json
from typing import List, Dict
from tenacity import retry, stop_after_attempt, wait_exponential
from app.config import OLLAMA_URL, OLLAMA_MODEL

class OllamaService:
    def __init__(self):
        self.base_url = OLLAMA_URL
        self.model = OLLAMA_MODEL
        
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def generate(self, prompt: str) -> str:
        """Call Ollama API with retry logic"""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Lower temperature for consistent classification
                "num_predict": 500   # Limit response length
            }
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "").strip()
        except Exception as e:
            print(f"Ollama API error: {e}")
            raise
    
    def batch_classify_categories(self, transactions: List[Dict]) -> Dict[int, str]:
        """Batch classify multiple transactions"""
        if not transactions:
            return {}
        
        # Prepare transaction descriptions
        transaction_texts = []
        for idx, txn in enumerate(transactions):
            text = f"Transaction {idx}: Merchant '{txn.get('merchant', 'Unknown')}', Amount {txn.get('amount', 0)} {txn.get('currency', 'INR')}"
            if txn.get('notes'):
                text += f", Notes: {txn['notes']}"
            transaction_texts.append(text)
        
        categories = ['Food', 'Shopping', 'Travel', 'Transport', 'Utilities', 'Cash Withdrawal', 'Entertainment', 'Other']
        
        prompt = f"""You are a transaction categorizer. Classify each transaction into exactly one category from: {', '.join(categories)}.

Transactions:
{chr(10).join(transaction_texts)}

Return ONLY a JSON object mapping transaction indices to categories. Example: {{"0": "Food", "1": "Shopping"}}

Do not include any other text or explanation."""

        try:
            response = self.generate(prompt)
            # Clean response - remove markdown code blocks if present
            response = response.replace('```json', '').replace('```', '').strip()
            result = json.loads(response)
            return {int(k): v for k, v in result.items()}
        except json.JSONDecodeError:
            # Fallback: return default categories
            return {i: "Other" for i in range(len(transactions))}
        except Exception as e:
            print(f"Classification failed: {e}")
            return {}
    
    def generate_summary(self, transactions: List[Dict]) -> Dict:
        """Generate narrative summary"""
        # Prepare transaction summary for LLM
        total_spend = sum(t.get('amount', 0) for t in transactions)
        anomaly_count = sum(1 for t in transactions if t.get('is_anomaly', False))
        unique_merchants = len(set(t.get('merchant', '') for t in transactions))
        
        # Sample top merchants
        merchant_spend = {}
        for t in transactions:
            merchant = t.get('merchant', 'Unknown')
            merchant_spend[merchant] = merchant_spend.get(merchant, 0) + t.get('amount', 0)
        
        top_merchants = sorted(merchant_spend.items(), key=lambda x: x[1], reverse=True)[:3]
        
        prompt = f"""Analyze these transaction statistics and return a JSON response:

Total Transactions: {len(transactions)}
Total Spend: {total_spend}
Anomalies Found: {anomaly_count}
Unique Merchants: {unique_merchants}
Top 3 Merchants: {', '.join([f"{m} ({amt})" for m, amt in top_merchants])}

Return JSON with:
1. "narrative": A 2-3 sentence spending analysis
2. "risk_level": "low", "medium", or "high" (based on anomaly_count > 5 = high, > 2 = medium, else low)

Example: {{"narrative": "User spent mostly on Food and Transport...", "risk_level": "low"}}"""

        try:
            response = self.generate(prompt)
            response = response.replace('```json', '').replace('```', '').strip()
            result = json.loads(response)
            return result
        except:
            # Fallback summary
            risk = "high" if anomaly_count > 5 else "medium" if anomaly_count > 2 else "low"
            return {
                "narrative": f"Processed {len(transactions)} transactions totaling {total_spend}. Found {anomaly_count} anomalies.",
                "risk_level": risk
            }

# Singleton instance
ollama_service = OllamaService()