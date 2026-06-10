import requests
import time

def preload_ollama_model():
    """Ensure Gemma3 model is pulled before starting"""
    print("Checking Ollama model...")
    
    # Wait for Ollama to be ready
    for _ in range(30):
        try:
            response = requests.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                break
        except:
            pass
        time.sleep(2)
    
    # Pull model if not present
    models = requests.get("http://localhost:11434/api/tags").json()
    model_names = [m['name'] for m in models.get('models', [])]
    
    if 'gemma3:4b' not in model_names:
        print("Downloading gemma3:4b model (this may take 5-10 minutes)...")
        requests.post("http://localhost:11434/api/pull", json={"name": "gemma3:4b"})
        print("Model downloaded!")
    else:
        print("Model already available")

if __name__ == "__main__":
    preload_ollama_model()