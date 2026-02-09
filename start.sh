#!/bin/bash

echo "==================================="
echo "Starting FitAI Application"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store the root directory
ROOT_DIR=$(pwd)

# Check if setup has been run
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${RED}ERROR: Frontend dependencies not found. Please run ./setup.sh first.${NC}"
    exit 1
fi

if [ ! -d "backend/.venv" ]; then
    echo -e "${RED}ERROR: Backend virtual environment not found. Please run ./setup.sh first.${NC}"
    exit 1
fi

echo -e "${YELLOW}[INFO]${NC} Starting Backend Server (Django)..."
echo -e "${YELLOW}[INFO]${NC} Backend will be available at http://localhost:8000"
echo ""

# Start backend in a new terminal window
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$ROOT_DIR/backend' && echo '===================================' && echo 'FitAI Backend Server' && echo '===================================' && .venv/bin/python manage.py runserver; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -hold -e "cd '$ROOT_DIR/backend' && echo '===================================' && echo 'FitAI Backend Server' && echo '===================================' && .venv/bin/python manage.py runserver" &
elif command -v konsole &> /dev/null; then
    konsole --new-tab -e bash -c "cd '$ROOT_DIR/backend' && echo '===================================' && echo 'FitAI Backend Server' && echo '===================================' && .venv/bin/python manage.py runserver; exec bash" &
else
    # Fallback: run in background
    cd backend
    echo "===================================" > backend.log
    echo "FitAI Backend Server" >> backend.log
    echo "===================================" >> backend.log
    .venv/bin/python manage.py runserver >> backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}[OK]${NC} Backend started (PID: $BACKEND_PID) - logs in backend.log"
fi

# Wait a moment for backend to start
sleep 2

echo ""
echo -e "${YELLOW}[INFO]${NC} Starting Frontend Development Server (Vite)..."
echo -e "${YELLOW}[INFO]${NC} Frontend will be available at http://localhost:5173"
echo ""

# Start frontend in a new terminal window
cd frontend
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$ROOT_DIR/frontend' && echo '===================================' && echo 'FitAI Frontend Server' && echo '===================================' && npm run dev; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -hold -e "cd '$ROOT_DIR/frontend' && echo '===================================' && echo 'FitAI Frontend Server' && echo '===================================' && npm run dev" &
elif command -v konsole &> /dev/null; then
    konsole --new-tab -e bash -c "cd '$ROOT_DIR/frontend' && echo '===================================' && echo 'FitAI Frontend Server' && echo '===================================' && npm run dev; exec bash" &
else
    # Fallback: run in background
    echo "===================================" > frontend.log
    echo "FitAI Frontend Server" >> frontend.log
    echo "===================================" >> frontend.log
    npm run dev >> frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}[OK]${NC} Frontend started (PID: $FRONTEND_PID) - logs in frontend/frontend.log"
fi

cd ..

echo ""
echo "==================================="
echo -e "${GREEN}Both servers are starting!${NC}"
echo "==================================="
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "To stop the servers:"
echo "  - If using terminal windows: Close the terminal windows"
echo "  - If using background processes: Run 'pkill -f \"manage.py runserver\"' and 'pkill -f \"npm run dev\"'"
echo ""
read -p "Press Enter to continue..."
