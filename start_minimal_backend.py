#!/usr/bin/env python3
"""
Startup script for the minimal ML Backend Service
"""

import subprocess
import sys
import os

def main():
    print("🤖 AI EduPulse - Minimal ML Backend Service")
    print("=" * 50)
    print("🚀 Starting ML Backend (minimal version)...")
    print("📍 Backend will be available at: http://localhost:5000")
    print("=" * 50)
    
    # Change to the ml_backend directory
    os.chdir('ml_backend')
    
    # Start the minimal Flask app
    subprocess.run([sys.executable, 'app_minimal.py'])

if __name__ == "__main__":
    main()
