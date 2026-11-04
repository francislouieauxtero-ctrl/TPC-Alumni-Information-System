@echo off
setlocal enabledelayedexpansion
title TPC Alumni System - Local Launcher

echo ========================================================
echo   TPC ALUMNI INFORMATION AND CAREER MANAGEMENT SYSTEM
echo             Direct Local Machine Launcher
echo ========================================================
echo.

cd /d "%~dp0"

REM ---------------------------------------------------------
REM Step 1: Validate Project Folder
REM ---------------------------------------------------------
if not exist "%~dp0backend\artisan" (
    echo [ERROR] Cannot find backend\artisan.
    echo Please run run-local.bat from the project root folder.
    pause
    exit /b 1
)

if not exist "%~dp0admin-web\package.json" (
    echo [ERROR] Cannot find admin-web\package.json.
    echo Please run run-local.bat from the project root folder.
    pause
    exit /b 1
)

REM ---------------------------------------------------------
REM Step 2: Check Prerequisites (PHP & Node.js)
REM ---------------------------------------------------------
echo [1/4] Checking prerequisites...

where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP is not found in your PATH.
    echo Please install PHP 8.2+ or add your PHP folder to your System PATH.
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please install Node.js (v18+) from https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found in your PATH.
    pause
    exit /b 1
)

echo [OK] PHP and Node.js are available.

REM ---------------------------------------------------------
REM Step 3: Check MySQL Connection (XAMPP / Local)
REM ---------------------------------------------------------
echo [2/4] Checking MySQL connection on 127.0.0.1:3306...
powershell -NoProfile -Command "$tcp = New-Object System.Net.Sockets.TcpClient; try { $tcp.Connect('127.0.0.1', 3306); $tcp.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] MySQL does NOT appear to be running on port 3306!
    echo If you use XAMPP, please open the XAMPP Control Panel and start MySQL.
    echo.
    echo Press any key to continue anyway, or close this window and start MySQL first.
    pause
) else (
    echo [OK] MySQL is active on port 3306.
)

REM ---------------------------------------------------------
REM Step 4: Ensure Storage Symlink Exists
REM ---------------------------------------------------------
echo [3/4] Checking storage symlink...
if not exist "%~dp0backend\public\storage" (
    cd "%~dp0backend"
    php artisan storage:link >nul 2>&1
    cd "%~dp0"
    echo [OK] Storage symlink created.
) else (
    echo [OK] Storage symlink already configured.
)

REM ---------------------------------------------------------
REM Step 5: Start Backend and Frontend
REM ---------------------------------------------------------
echo [4/4] Launching application services...
echo.

REM Start Laravel Backend on port 8000
start "TPC Alumni - Laravel Backend (Port 8000)" cmd /k "title TPC Alumni - Backend && cd /d "%~dp0backend" && php artisan serve --host=127.0.0.1 --port=8000"

REM Start Vite Frontend on port 3000
start "TPC Alumni - React Frontend (Port 3000)" cmd /k "title TPC Alumni - Frontend && cd /d "%~dp0admin-web" && npm run dev"

echo Waiting for services to initialize...
timeout /t 3 /nobreak >nul

REM Open Browser
start http://localhost:3000

echo.
echo ========================================================
echo   TPC Alumni System is running!
echo.
echo   Frontend Application: http://localhost:3000
echo   Backend API:          http://127.0.0.1:8000/api
echo   phpMyAdmin:           http://localhost/phpmyadmin
echo.
echo   Default Admin Login:
echo     Email:    francislouieauxtero@gmail.com
echo     Password: password
echo.
echo   Keep the two opened command windows running while using
echo   the system. Close them when you want to stop the servers.
echo ========================================================
echo.
pause

