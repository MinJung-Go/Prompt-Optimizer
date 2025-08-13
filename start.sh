#!/bin/bash
source ./env
echo "Starting Prompt Optimizer..."

# Check if backend requirements are installed
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo "Activating virtual environment..."
    source backend/venv/bin/activate
fi

# Start backend in background
echo "Starting FastAPI backend..."
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8192 &
export REACT_APP_API_URL=http://localhost:8192/api/v1
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "Prompt Optimizer started successfully!"
echo "Backend: $REACT_APP_API_URL"
echo "Frontend: http://0.0.0.0:3000"
echo "API Docs: http://0.0.0.0:8192/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait