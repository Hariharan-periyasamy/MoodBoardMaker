#!/bin/bash

# MoodBoard — Full Stack Workspace Starter
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo " ============================================================="
echo "       MoodBoard — Interactive Digital Inspiration Hub"
echo " ============================================================="
echo ""

# 1. Verify Directory Structure
if [ ! -f "$SCRIPT_DIR/backend/package.json" ]; then
    echo " [ERROR] backend/package.json not found!"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/frontend/package.json" ]; then
    echo " [ERROR] frontend/package.json not found!"
    exit 1
fi

# 2. Check dependencies
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo " [INFO] Installing backend dependencies..."
    (cd "$SCRIPT_DIR/backend" && npm install)
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo " [INFO] Installing frontend dependencies..."
    (cd "$SCRIPT_DIR/frontend" && npm install)
fi

# 3. Clean up ports 5000 & 5173 if busy
echo " [1/3] Checking ports 5000 & 5173..."
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# Kill child processes on exit (Ctrl+C)
trap "kill 0" EXIT

# 4. Start Backend
echo " [2/3] Starting Backend API Server (Port 5000)..."
cd "$SCRIPT_DIR/backend" && npm run dev &
BACKEND_PID=$!

sleep 3

# 5. Start Frontend
echo " [3/3] Starting Frontend React App (Port 5173)..."
cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

sleep 2

echo ""
echo " ============================================================="
echo "   SUCCESS! Both servers are running:"
echo ""
echo "   - Frontend:    http://localhost:5173"
echo "   - Backend:     http://localhost:5000"
echo "   - API Health:  http://localhost:5000/api/health"
echo ""
echo "   Press Ctrl+C to stop both servers."
echo " ============================================================="
echo ""

wait $BACKEND_PID $FRONTEND_PID
