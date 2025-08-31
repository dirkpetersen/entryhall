#!/bin/bash

echo "Restarting Woerk application with updated styling..."

# Kill any existing processes
lsof -ti :3020,3021 | xargs kill -9 2>/dev/null || true
lsof -ti :3010,3011 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to die
sleep 2

# Rebuild frontend with new CSS
cd frontend
echo "Building frontend with updated styling..."
npm run build

# Start development servers
cd ..
echo "Starting development servers..."
./start-dev.sh