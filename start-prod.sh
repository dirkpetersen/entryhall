#!/bin/bash

# Start production servers with default ports 3010 (backend) and 3011 (frontend)

echo "Starting Woerk production servers..."
echo "Frontend will be available at: http://localhost:3011"
echo "Backend API will be available at: http://localhost:3010"
echo "Swagger docs will be available at: http://localhost:3010/api"
echo ""

# Kill any existing processes on these ports
lsof -ti :3010 | xargs kill -9 2>/dev/null || true
lsof -ti :3011 | xargs kill -9 2>/dev/null || true

# Build and start backend on port 3010
cd backend
echo "Building backend..."
npm run build
echo "Starting backend on port 3010..."
PORT=3010 node dist/main.js &
BACKEND_PID=$!

# Build and start frontend on port 3011
cd ../frontend
echo "Building frontend..."
npm run build
echo "Starting frontend on port 3011..."
PORT=3011 npm run start &
FRONTEND_PID=$!

echo ""
echo "Production servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait