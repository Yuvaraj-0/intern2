import pandas as pd
import re
from datetime import datetime

def clean_dataframe(df):
    """Clean and normalize the dataframe"""
    df = df.copy()
    
    # 1. Remove exact duplicate rows
    df = df.drop_duplicates()
    
    # 2. Normalize dates (DD-MM-YYYY and YYYY/MM/DD → YYYY-MM-DD)
    def clean_date(date_str):
        if pd.isna(date_str) or date_str == '':
            return None
        date_str = str(date_str).strip()
        
        # Try DD-MM-YYYY format
        try:
            if '-' in date_str and len(date_str.split('-')[0]) == 2:
                return datetime.strptime(date_str, '%d-%m-%Y').strftime('%Y-%m-%d')
        except:
            pass
        
        # Try YYYY/MM/DD format
        try:
            if '/' in date_str:
                return datetime.strptime(date_str, '%Y/%m/%d').strftime('%Y-%m-%d')
        except:
            pass
        
        # If already in YYYY-MM-DD, return as is
        if re.match(r'\d{4}-\d{2}-\d{2}', date_str):
            return date_str
        
        return None
    
    # 3. Clean amounts - remove $, ₹ and convert to float
    def clean_amount(amount):
        if pd.isna(amount):
            return 0.0
        amount_str = str(amount).strip()
        # Remove currency symbols ($, ₹, etc.) but keep decimal points
        amount_str = re.sub(r'[^\d.-]', '', amount_str)
        try:
            return float(amount_str)
        except:
            return 0.0
    
    # 4. Clean currency - uppercase
    def clean_currency(currency):
        if pd.isna(currency):
            return 'INR'
        return str(currency).strip().upper()
    
    # 5. Clean status - uppercase
    def clean_status(status):
        if pd.isna(status):
            return 'PENDING'
        return str(status).strip().upper()
    
    # 6. Fill missing categories
    def clean_category(category):
        if pd.isna(category) or str(category).strip() == '':
            return 'Uncategorised'
        return str(category).strip()
    
    # Apply all cleaning functions
    if 'date' in df.columns:
        df['date'] = df['date'].apply(clean_date)
    
    if 'amount' in df.columns:
        df['amount'] = df['amount'].apply(clean_amount)
    
    if 'currency' in df.columns:
        df['currency'] = df['currency'].apply(clean_currency)
    
    if 'status' in df.columns:
        df['status'] = df['status'].apply(clean_status)
    
    if 'category' in df.columns:
        df['category'] = df['category'].apply(clean_category)
    
    # Remove rows with invalid dates or zero/negative amounts
    if 'date' in df.columns:
        df = df.dropna(subset=['date'])
    if 'amount' in df.columns:
        df = df[df['amount'] > 0]
    
    return df