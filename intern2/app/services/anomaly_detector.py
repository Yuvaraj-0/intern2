import pandas as pd

DOMESTIC_BRANDS = {'swiggy', 'ola', 'irctc', 'zomato', 'flipkart', 'amazon', 'amazon.in'}

def detect_anomalies(df):
    """Detect anomalies in transactions"""
    df = df.copy()
    df['is_anomaly'] = False
    df['anomaly_reason'] = None
    
    # Calculate median per account
    account_medians = df.groupby('account_id')['amount'].median()
    
    anomalies_found = 0
    
    for idx, row in df.iterrows():
        reasons = []
        
        # Statistical outlier
        if row['account_id'] in account_medians.index:
            median = account_medians[row['account_id']]
            if row['amount'] > median * 3:
                reasons.append(f"Amount exceeds 3x account median ({median:.2f})")
        
        # Currency mismatch
        if row['currency'] == 'USD' and row['merchant'].lower() in DOMESTIC_BRANDS:
            reasons.append(f"USD payment to domestic brand {row['merchant']}")
        
        if reasons:
            df.at[idx, 'is_anomaly'] = True
            df.at[idx, 'anomaly_reason'] = '; '.join(reasons)
            anomalies_found += 1
    
    print(f"Found {anomalies_found} anomalies")
    return df
