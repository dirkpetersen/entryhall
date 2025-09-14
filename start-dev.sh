#!/bin/bash

# Start development servers with ports 3020 (backend) and 3021 (frontend)

echo "Starting Woerk development servers..."
echo "Frontend will be available at: http://localhost:3021"
echo "Backend API will be available at: http://localhost:3020"
echo "Swagger docs will be available at: http://localhost:3020/api"
echo ""

# Check if PostgreSQL is running
check_postgres() {
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        echo "✓ PostgreSQL is running"
        return 0
    else
        echo "✗ PostgreSQL is not running"
        return 1
    fi
}

# Start PostgreSQL if not running
start_postgres() {
    echo "Attempting to start PostgreSQL..."
    
    # Try to start with systemd
    if command -v systemctl >/dev/null 2>&1; then
        echo "Using systemctl to start postgresql..."
        if sudo systemctl start postgresql; then
            echo "✓ PostgreSQL started successfully via systemctl"
            sleep 2  # Give PostgreSQL time to start
            return 0
        else
            echo "✗ Failed to start PostgreSQL via systemctl"
        fi
    fi
    
    # Try alternative service command
    if command -v service >/dev/null 2>&1; then
        echo "Using service command to start postgresql..."
        if sudo service postgresql start; then
            echo "✓ PostgreSQL started successfully via service command"
            sleep 2
            return 0
        else
            echo "✗ Failed to start PostgreSQL via service command"
        fi
    fi
    
    echo "✗ Could not start PostgreSQL automatically"
    echo "Please start PostgreSQL manually and run this script again"
    echo "Common commands:"
    echo "  sudo systemctl start postgresql"
    echo "  sudo service postgresql start"
    echo "  pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start"
    exit 1
}

# Ensure PostgreSQL is running
echo "Checking PostgreSQL status..."
if ! check_postgres; then
    start_postgres
    # Verify it started
    if ! check_postgres; then
        echo "✗ PostgreSQL failed to start"
        exit 1
    fi
fi

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