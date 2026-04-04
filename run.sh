#!/bin/bash

echo "🎵 Starting RoSY Music Player..."

# 1. Kill any existing processes on our ports
echo "🧹 Cleaning up old processes on ports 3000 and 5000..."
fuser -k 3000/tcp 2>/dev/null
fuser -k 5000/tcp 2>/dev/null
pkill -f "runserver 5000" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

sleep 2

# 2. Start the Django Backend
echo "🐍 Starting Django Backend on port 5000..."
cd backend
../venv/bin/python manage.py runserver 5000 &
BACKEND_PID=$!
cd ..

# 3. Start the React Frontend
echo "⚛️ Starting React Frontend on port 3000..."
cd frontend
# Run in background and pipe output to avoid clogging the terminal
BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

echo "✅ All systems go! The application is running."
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers gracefully."

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
