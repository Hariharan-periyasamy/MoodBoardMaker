@echo off
title MoodBoard — Full Stack Workspace
color 0B

echo.
echo  =============================================================
echo        MoodBoard — Interactive Digital Inspiration Hub
echo  =============================================================
echo.

:: 1. Verify Node.js and NPM
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js is not found in your system PATH!
    echo         Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] npm is not found in your system PATH!
    echo.
    pause
    exit /b 1
)

:: 2. Verify Directory Structure
if not exist "%~dp0backend\package.json" (
    color 0C
    echo  [ERROR] backend\package.json not found!
    echo         Please run this script from the project root folder.
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0frontend\package.json" (
    color 0C
    echo  [ERROR] frontend\package.json not found!
    echo         Please run this script from the project root folder.
    echo.
    pause
    exit /b 1
)

:: 3. Verify backend .env file
if not exist "%~dp0backend\.env" (
    if exist "%~dp0backend\.env.example" (
        echo  [INFO] backend\.env not found. Creating from .env.example...
        copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
        echo  [WARNING] Please configure your MONGODB_URI in backend\.env!
    )
)

:: 4. Verify Dependencies
if not exist "%~dp0backend\node_modules" (
    echo  [INFO] Installing backend dependencies (first time setup)...
    call npm --prefix "%~dp0backend" install
)

if not exist "%~dp0frontend\node_modules" (
    echo  [INFO] Installing frontend dependencies (first time setup)...
    call npm --prefix "%~dp0frontend" install
)

:: 5. Free ports 5000 and 5173 if lingering from a previous session
echo  [1/4] Checking and clearing ports 5000 & 5173...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r ":5000.*LISTENING"') do (
    taskkill /f /pid %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r ":5173.*LISTENING"') do (
    taskkill /f /pid %%p >nul 2>&1
)

:: 6. Launch Backend Server
echo  [2/4] Launching Backend API Server (Port 5000)...
start "MoodBoard Backend (Port 5000)" /d "%~dp0backend" cmd /k "npm run dev"

:: Wait for backend to initialize
timeout /t 3 /nobreak >nul

:: 7. Launch Frontend React Server
echo  [3/4] Launching Frontend React App (Port 5173)...
start "MoodBoard Frontend (Port 5173)" /d "%~dp0frontend" cmd /k "npm run dev"

:: Wait for Vite to build
timeout /t 3 /nobreak >nul

:: 8. Automatically open browser
echo  [4/4] Opening application in your default browser...
start http://localhost:5173

echo.
echo  =============================================================
echo    SUCCESS! Both servers are now running in separate windows:
echo.
echo    - Frontend App:   http://localhost:5173
echo    - Backend API:    http://localhost:5000
echo    - Health Check:   http://localhost:5000/api/health
echo.
echo    Keep the two popup terminal windows open while working.
echo    To stop the application, simply close those windows.
echo  =============================================================
echo.
pause
