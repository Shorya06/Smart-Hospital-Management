#!/bin/bash
# Smart Hospital Management System - Demo Script (Linux/Mac)
# This script sets up and runs the system locally

echo "========================================"
echo "Smart Hospital Management System"
echo "Local Demo Script"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 16+"
    exit 1
fi

echo "[1/6] Setting up backend..."
cd smart_hms/backend

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations > /dev/null 2>&1
python manage.py migrate > /dev/null 2>&1

# Seed data
echo "Seeding database with sample data..."
python manage.py seed_data

echo ""
echo "[2/6] Backend setup complete!"
echo ""
echo "[3/6] Starting backend server..."
echo "Backend will run on http://localhost:8000"
echo ""
python manage.py runserver > /dev/null 2>&1 &
BACKEND_PID=$!

# Wait a bit for server to start
sleep 3

echo ""
echo "[4/6] Setting up frontend..."
cd ../frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install > /dev/null 2>&1

echo ""
echo "[5/6] Frontend setup complete!"
echo ""
echo "[6/6] Starting frontend server..."
echo "Frontend will run on http://localhost:5173"
echo ""
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Access Points:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000/api/"
echo "  Admin:     http://localhost:8000/admin/"
echo ""
echo "Demo Credentials:"
echo "  Admin:     admin / admin123"
echo "  Doctor:    dr_smith / doctor123"
echo "  Patient:   patient1 / patient123"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

