#!/usr/bin/env python3
"""
Debug test for the ML backend
"""

import requests
import pandas as pd

def test_backend():
    print("🔍 Debugging ML Backend...")
    
    # Test 1: Health check
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        print(f"Health check: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return
    
    # Test 2: Upload sample dataset
    try:
        with open('sample_datasets/iris_sample.csv', 'rb') as f:
            files = {'file': f}
            response = requests.post('http://localhost:5000/api/upload-dataset', files=files, timeout=30)
        
        print(f"Upload status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Upload successful!")
            print(f"Dataset shape: {data['dataset_info']['shape']}")
            print(f"Best model: {data['feedback']['model_performance']['best_model']}")
        else:
            print(f"❌ Upload failed: {response.text}")
            
    except Exception as e:
        print(f"Upload error: {e}")

if __name__ == "__main__":
    test_backend()
