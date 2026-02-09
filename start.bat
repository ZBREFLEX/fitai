@echo off
echo ===================================
echo Starting FitAI Application
echo ===================================
echo.

REM Store the root directory
set ROOT_DIR=%CD%

REM Check if setup has been run
if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies not found. Please run setup.bat first.
    exit /b 1
)

if not exist "backend\.venv" (
    echo ERROR: Backend virtual environment not found. Please run setup.bat first.
    exit /b 1
)

echo [INFO] Starting Backend Server (Django)...
echo [INFO] Backend will be available at http://localhost:8000
echo.

REM Start backend in a new window
cd backend
start "FitAI Backend" cmd /c "echo =================================== && echo FitAI Backend Server && echo =================================== && .venv\Scripts\python manage.py runserver"
cd ..

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

echo.
echo [INFO] Starting Frontend Development Server (Vite)...
echo [INFO] Frontend will be available at http://localhost:5173
echo.

REM Start frontend in a new window
cd frontend
start "FitAI Frontend" cmd /c "echo =================================== && echo FitAI Frontend Server && echo =================================== && npm run dev"
cd ..

echo.
echo ===================================
echo Both servers are starting!
echo ===================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo To stop the servers, close the backend and frontend windows.
echo.
pause
