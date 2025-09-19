#!/usr/bin/env python3
"""
Simple startup script for the ML Backend Service (without TensorFlow)
"""

import subprocess
import sys
import os

def main():
    print("🤖 AI EduPulse - Simple ML Backend Service")
    print("=" * 50)
    print("🚀 Starting ML Backend (without TensorFlow)...")
    print("📍 Backend will be available at: http://localhost:5000")
    print("=" * 50)
    
    # Change to the ml_backend directory
    os.chdir('ml_backend')
    
    # Start the simplified Flask app
    subprocess.run([sys.executable, 'app_simple.py'])

if __name__ == "__main__":
    main()
