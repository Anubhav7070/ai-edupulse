#!/usr/bin/env python3
"""
Startup script for the ML Backend Service
Run this script to start the Flask ML backend server
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        'flask', 'pandas', 'numpy', 'scikit-learn', 
        'xgboost', 'tensorflow', 'matplotlib', 'seaborn', 
        'plotly', 'scikit-plot', 'flask-cors'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        subprocess.run([sys.executable, '-m', 'pip', 'install'] + missing_packages)
    else:
        print("✅ All required packages are installed")

def start_backend():
    """Start the ML backend server"""
    print("🚀 Starting ML Backend Service...")
    print("📍 Backend will be available at: http://localhost:5000")
    print("📊 API endpoints:")
    print("   - POST /api/upload-dataset")
    print("   - GET /api/get-dataset-info")
    print("   - GET /api/get-model-results")
    print("   - POST /api/train-ensemble")
    print("\n" + "="*50)
    
    # Change to the ml_backend directory
    os.chdir('ml_backend')
    
    # Start the Flask app
    subprocess.run([sys.executable, 'app.py'])

if __name__ == "__main__":
    print("🤖 AI EduPulse - ML Backend Service")
    print("="*50)
    
    # Check dependencies
    check_dependencies()
    
    # Start the backend
    start_backend()
