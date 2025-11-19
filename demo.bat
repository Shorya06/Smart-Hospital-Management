@echo off
REM Smart Hospital Management System - Demo Script (Windows)
REM This script sets up and runs the system locally

echo ========================================
echo Smart Hospital Management System
echo Local Demo Script
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

echo [1/6] Setting up backend...
cd smart_hms\backend

REM Create venv if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
pip install -q -r requirements.txt

REM Run migrations
echo Running database migrations...
python manage.py makemigrations >nul 2>&1
python manage.py migrate >nul 2>&1

REM Seed data
echo Seeding database with sample data...
python manage.py seed_data

echo.
echo [2/6] Backend setup complete!
echo.
echo [3/6] Starting backend server...
echo Backend will run on http://localhost:8000
echo.
start "Backend Server" cmd /k "cd smart_hms\backend && venv\Scripts\activate.bat && python manage.py runserver"

REM Wait a bit for server to start
timeout /t 3 /nobreak >nul

echo.
echo [4/6] Setting up frontend...
cd ..\frontend

REM Install dependencies
echo Installing frontend dependencies...
call npm install >nul 2>&1

echo.
echo [5/6] Frontend setup complete!
echo.
echo [6/6] Starting frontend server...
echo Frontend will run on http://localhost:5173
echo.
start "Frontend Server" cmd /k "cd smart_hms\frontend && npm run dev"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Access Points:
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000/api/
echo   Admin:     http://localhost:8000/admin/
echo.
echo Demo Credentials:
echo   Admin:     admin / admin123
echo   Doctor:    dr_smith / doctor123
echo   Patient:   patient1 / patient123
echo.
echo Press any key to exit...
pause >nul

