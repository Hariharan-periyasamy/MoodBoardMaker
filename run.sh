#!/bin/bash

# MoodBoard — Concurrent Frontend & Backend Starter
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo " ====================================================="
echo "  MoodBoard — Starting Frontend and Backend Servers"
echo " ====================================================="
echo ""

# Verify project structure
if [ ! -f "$SCRIPT_DIR/backend/package.json" ]; then
    echo " [ERROR] backend/package.json not found!"
    echo "         Run this script from the project root folder."
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/frontend/package.json" ]; then
    echo " [ERROR] frontend/package.json not found!"
    echo "         Run this script from the project root folder."
    exit 1
fi

# Kill all child processes when this script exits (Ctrl+C)
trap "kill 0" EXIT

# Start Backend
echo " [1/2] Starting Backend API Server..."
cd "$SCRIPT_DIR/backend" && npm run dev &
BACKEND_PID=$!

# Give backend 2 seconds head start
sleep 2

# Start Frontend
echo " [2/2] Starting Frontend React App..."
cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo " ====================================================="
echo "  Both servers running!"
echo ""
echo "  Frontend:   http://localhost:5173"
echo "  Backend:    http://localhost:5000"
echo "  API Health: http://localhost:5000/api/health"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo " ====================================================="
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
