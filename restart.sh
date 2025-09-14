#!/bin/bash

echo "Restarting Woerk application with updated code..."

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
    exit 1
}

# Ensure PostgreSQL is running
echo "Checking PostgreSQL status..."
if ! check_postgres; then
    start_postgres
    if ! check_postgres; then
        echo "✗ PostgreSQL failed to start"
        exit 1
    fi
fi

# Kill any existing processes
lsof -ti :3020,3021 | xargs kill -9 2>/dev/null || true
lsof -ti :3010,3011 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to die
sleep 2

# Rebuild frontend with new code
cd frontend
echo "Building frontend with updated code..."
npm run build

# Start development servers
cd ..
echo "Starting development servers..."
./start-dev.sh