#!/usr/bin/env python3
"""
Test script for the AI EduPulse ML System
Tests both backend API and frontend integration
"""

import requests
import time
import json
import os
import sys

def test_backend_api():
    """Test the ML backend API endpoints"""
    print("🧪 Testing ML Backend API...")
    
    base_url = "http://localhost:5000/api"
    
    try:
        # Test 1: Check if backend is running
        print("1. Testing backend connectivity...")
        response = requests.get(f"{base_url}/get-dataset-info", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend is running")
        else:
            print(f"   ❌ Backend returned status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Backend is not running. Please start it with: python start_ml_backend.py")
        return False
    except Exception as e:
        print(f"   ❌ Error connecting to backend: {e}")
        return False
    
    # Test 2: Upload sample dataset
    print("2. Testing dataset upload...")
    try:
        # Use the iris sample dataset
        sample_file = "sample_datasets/iris_sample.csv"
        if not os.path.exists(sample_file):
            print(f"   ❌ Sample dataset not found: {sample_file}")
            return False
            
        with open(sample_file, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{base_url}/upload-dataset", files=files, timeout=30)
            
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Dataset uploaded successfully")
            print(f"   📊 Dataset shape: {data['dataset_info']['shape']}")
            print(f"   🏆 Best model: {data['feedback']['model_performance']['best_model']}")
            print(f"   📈 Best accuracy: {data['feedback']['model_performance']['best_accuracy']:.2%}")
            return True
        else:
            print(f"   ❌ Upload failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error uploading dataset: {e}")
        return False

def test_frontend():
    """Test if frontend is accessible"""
    print("\n🌐 Testing Frontend...")
    
    # Try both common ports
    ports = [8080, 5173, 3000]
    
    for port in ports:
        try:
            response = requests.get(f"http://localhost:{port}", timeout=5)
            if response.status_code == 200:
                print(f"   ✅ Frontend is running on port {port}")
                return True
        except requests.exceptions.ConnectionError:
            continue
        except Exception as e:
            continue
    
    print("   ❌ Frontend is not running. Please start it with: npm run dev")
    return False

def main():
    """Run all tests"""
    print("🤖 AI EduPulse ML System - Integration Test")
    print("=" * 50)
    
    # Wait a moment for services to start
    print("⏳ Waiting for services to start...")
    time.sleep(3)
    
    # Test backend
    backend_ok = test_backend_api()
    
    # Test frontend
    frontend_ok = test_frontend()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    print(f"   Backend API: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"   Frontend: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 All tests passed! System is ready to use.")
        print("\n📝 Next steps:")
        print("   1. Open http://localhost:5173 in your browser")
        print("   2. Navigate to the Dataset Recommender section")
        print("   3. Upload a CSV or Excel file to test the ML system")
        print("   4. Explore the analysis, visualization, and feedback tabs")
    else:
        print("\n⚠️  Some tests failed. Please check the error messages above.")
        if not backend_ok:
            print("   - Start the ML backend: python start_ml_backend.py")
        if not frontend_ok:
            print("   - Start the frontend: npm run dev")
    
    return backend_ok and frontend_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
