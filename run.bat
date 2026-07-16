@echo off
title MoodBoard — Starting Workspace
color 0A

echo.
echo  =====================================================
echo   MoodBoard — Starting Frontend and Backend Servers
echo  =====================================================
echo.

:: Verify project structure
if not exist "%~dp0backend\package.json" (
    echo  [ERROR] backend\package.json not found!
    echo         Make sure you run this file from the project root folder.
    pause
    exit /b 1
)

if not exist "%~dp0frontend\package.json" (
    echo  [ERROR] frontend\package.json not found!
    echo         Make sure you run this file from the project root folder.
    pause
    exit /b 1
)

echo  [1/2] Launching Backend API Server...
start "MoodBoard Backend" /d "%~dp0backend" cmd /k "npm run dev"

:: Small delay so backend starts first
timeout /t 2 /nobreak >nul

echo  [2/2] Launching Frontend React App...
start "MoodBoard Frontend" /d "%~dp0frontend" cmd /k "npm run dev"

echo.
echo  =====================================================
echo   Both servers are starting in separate windows!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo   API Health: http://localhost:5000/api/health
echo.
echo   Close the terminal windows to stop the servers.
echo  =====================================================
echo.
pause
