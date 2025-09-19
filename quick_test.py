#!/usr/bin/env python3
"""
Quick test for the ML system
"""

import requests
import json

def test_upload():
    print("🧪 Testing ML Backend Upload...")
    
    try:
        # Test with iris dataset
        with open('sample_datasets/iris_sample.csv', 'rb') as f:
            files = {'file': f}
            response = requests.post('http://localhost:5000/api/upload-dataset', files=files, timeout=30)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Upload and analysis completed!")
            print(f"📊 Dataset: {data['dataset_info']['shape'][0]} rows, {data['dataset_info']['shape'][1]} columns")
            print(f"🏆 Best Model: {data['feedback']['model_performance']['best_model']}")
            print(f"📈 Best Accuracy: {data['feedback']['model_performance']['best_accuracy']:.2%}")
            print(f"🔝 Top 3 Models: {data['top_3_models']}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    success = test_upload()
    if success:
        print("\n🎉 System is working! You can now:")
        print("1. Open http://localhost:8080 in your browser")
        print("2. Navigate to the Dataset Recommender section")
        print("3. Upload a CSV or Excel file")
        print("4. Watch real ML algorithms train and analyze your data!")
    else:
        print("\n⚠️  There's still an issue. Let me fix it...")
