#!/bin/bash

# Start development servers with ports 3020 (backend) and 3021 (frontend)

echo "Starting Woerk development servers..."
echo "Frontend will be available at: http://localhost:3021"
echo "Backend API will be available at: http://localhost:3020"
echo "Swagger docs will be available at: http://localhost:3020/api"
echo ""

# Kill any existing processes on these ports
lsof -ti :3020 | xargs kill -9 2>/dev/null || true
lsof -ti :3021 | xargs kill -9 2>/dev/null || true

# Start backend on port 3020
cd backend
echo "Building backend..."
npm run build
echo "Starting backend on port 3020..."
PORT=3020 CORS_ORIGIN="http://localhost:3021" node dist/main.js &
BACKEND_PID=$!

# Start frontend on port 3021
cd ../frontend
echo "Starting frontend on port 3021..."
NEXTAUTH_URL=http://localhost:3021 NEXT_PUBLIC_API_URL=http://localhost:3020 NEXT_PUBLIC_WS_URL=ws://localhost:3020 npm run dev -- --port 3021 &
FRONTEND_PID=$!

echo ""
echo "Development servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait