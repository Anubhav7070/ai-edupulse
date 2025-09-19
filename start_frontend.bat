@echo off
echo 🤖 AI EduPulse - Frontend Service
echo ================================================
echo 🚀 Starting React Frontend...
echo 📍 Frontend will be available at: http://localhost:5173
echo.
echo ⚠️  Make sure the ML Backend is running on port 5000
echo    Run: python start_ml_backend.py
echo.
echo ================================================
echo.

REM Start the React development server
npm run dev
