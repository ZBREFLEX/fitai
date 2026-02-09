#!/bin/bash

echo "==================================="
echo "FitAI Project Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install Node.js first.${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Node.js is installed"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python is not installed. Please install Python 3.10+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Python is installed"

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}[INFO]${NC} uv not found. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo -e "${GREEN}[OK]${NC} uv installed"
    # Reload PATH
    export PATH="$HOME/.local/bin:$PATH"
else
    echo -e "${GREEN}[OK]${NC} uv is installed"
fi

echo ""
echo "==================================="
echo "Setting up Frontend (npm install)"
echo "==================================="
cd frontend
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO]${NC} node_modules already exists. Running npm install to update dependencies..."
else
    echo -e "${YELLOW}[INFO]${NC} Installing npm dependencies..."
fi
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: npm install failed${NC}"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Frontend dependencies installed"
cd ..

echo ""
echo "==================================="
echo "Setting up Backend (uv venv)"
echo "==================================="
cd backend
if [ -d ".venv" ]; then
    echo -e "${YELLOW}[INFO]${NC} Virtual environment already exists. Skipping venv creation."
else
    echo -e "${YELLOW}[INFO]${NC} Creating virtual environment with uv..."
    uv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Failed to create virtual environment${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}[OK]${NC} Virtual environment ready"

# Install backend dependencies
echo -e "${YELLOW}[INFO]${NC} Installing backend dependencies..."
uv pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Backend dependencies installed"

# Run migrations
echo -e "${YELLOW}[INFO]${NC} Running Django migrations..."
.venv/bin/python manage.py migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to run migrations${NC}"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Migrations applied"

cd ..

echo ""
echo "==================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "==================================="
echo ""
echo "To start the application, run: ./start.sh"
echo ""
read -p "Press Enter to continue..."
