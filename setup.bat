@echo off
echo ===================================
echo FitAI Project Setup
echo ===================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js is installed

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed. Please install Python 3.10+ first.
    exit /b 1
)
echo [OK] Python is installed

REM Check if uv is installed
uv --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] uv not found. Installing uv...
    powershell -ExecutionPolicy ByPass -Command "& {irm https://astral.sh/uv/install.ps1 | iex}"
    echo [OK] uv installed
) else (
    echo [OK] uv is installed
)

echo.
echo ===================================
echo Setting up Frontend (npm install)
echo ===================================
cd frontend
if exist node_modules (
    echo [INFO] node_modules already exists. Running npm install to update dependencies...
) else (
    echo [INFO] Installing npm dependencies...
)
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

echo.
echo ===================================
echo Setting up Backend (uv venv)
echo ===================================
cd backend
if exist .venv (
    echo [INFO] Virtual environment already exists. Skipping venv creation.
) else (
    echo [INFO] Creating virtual environment with uv...
    uv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        exit /b 1
    )
)
echo [OK] Virtual environment ready

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
uv pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    exit /b 1
)
echo [OK] Backend dependencies installed

REM Run migrations
echo [INFO] Running Django migrations...
.venv\Scripts\python manage.py migrate
if errorlevel 1 (
    echo ERROR: Failed to run migrations
    exit /b 1
)
echo [OK] Migrations applied

cd ..

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo To start the application, run: start.bat
echo.
pause
