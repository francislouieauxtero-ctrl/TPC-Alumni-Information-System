@echo off
setlocal enabledelayedexpansion
title TPC Alumni Development Environment

REM ===================================================
REM   TPC Alumni - Local Development Server Launcher
REM   Standard Mode: docker compose up -d -> http://localhost
REM   Vite Dev Mode: start-dev.bat --vite -> http://localhost:3000
REM ===================================================

echo ===================================================
echo   TPC Alumni - Local Development Server Launcher
echo ===================================================
echo.

cd /d "%~dp0"

set "DEV_MODE=docker"
if /i "%~1"=="--vite" set "DEV_MODE=vite"
if /i "%~1"=="-v" set "DEV_MODE=vite"

REM --------------------------------------------------
REM [0/3] Verifying project directory...
REM --------------------------------------------------
if not exist "%~dp0docker-compose.yml" (
    echo [ERROR] Invalid project directory: docker-compose.yml not found.
    echo Please run start-dev.bat from the root of the TPC-Alumni repository.
    exit /b 1
)
if not exist "%~dp0backend\artisan" (
    echo [ERROR] Invalid project directory: backend\artisan not found.
    echo Please run start-dev.bat from the root of the TPC-Alumni repository.
    exit /b 1
)

REM --------------------------------------------------
REM [1/3] Checking Docker Engine health...
REM --------------------------------------------------
echo [1/3] Checking Docker Engine...

docker info >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Docker Engine is running and responsive.
    goto docker_ready
)

echo Docker Engine is not ready or hung. Attempting recovery...

REM Check if Docker Desktop processes are hanging
powershell -NoProfile -Command "Get-Process -Name '*docker*' -ErrorAction SilentlyContinue" >nul 2>&1
if !errorlevel! equ 0 (
    echo [RECOVERY] Stale or hung Docker processes detected. Restarting cleanly...
    powershell -NoProfile -Command "Get-Process -Name '*docker*' -ErrorAction SilentlyContinue | Stop-Process -Force; wsl --shutdown" >nul 2>&1
    powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul 2>&1
)

set "DOCKER_EXE="
if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" set "DOCKER_EXE=C:\Program Files\Docker\Docker\Docker Desktop.exe"
if not defined DOCKER_EXE if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" set "DOCKER_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not defined DOCKER_EXE if exist "%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe" set "DOCKER_EXE=%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe"

if not defined DOCKER_EXE (
    echo.
    echo [ERROR] Docker Desktop executable could not be found.
    echo Please start Docker Desktop manually and run start-dev.bat again.
    exit /b 1
)

echo Starting Docker Desktop...
powershell -NoProfile -Command "([wmiclass]'win32_process').Create('!DOCKER_EXE:\=\\!')" >nul 2>&1
if !errorlevel! neq 0 (
    start "" "!DOCKER_EXE!"
)

echo Waiting for Docker Engine to become ready...
set /a DOCKER_ATTEMPTS=0
:wait_docker_loop
docker info >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Docker Engine is ready.
    goto docker_ready
)
set /a DOCKER_ATTEMPTS+=1
if !DOCKER_ATTEMPTS! geq 35 goto docker_timeout
powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul 2>&1
goto wait_docker_loop

:docker_timeout
echo.
echo [ERROR] Docker Engine failed to become ready within 70 seconds.
echo Please ensure Docker Desktop is running and try again.
exit /b 1

:docker_ready
echo.

REM --------------------------------------------------
REM [2/3] Starting Docker application stack...
REM --------------------------------------------------
echo [2/3] Starting Docker services...

docker compose up -d
if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Docker services failed to start.
    echo Please run 'docker compose ps' and 'docker compose logs' to inspect.
    exit /b 1
)

echo Waiting for backend API (http://localhost:8070/api/departments)...
set /a BACKEND_ATTEMPTS=0
:wait_backend_loop
curl.exe -s -f --connect-timeout 2 --max-time 4 -o nul http://127.0.0.1:8070/api/departments >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Backend services ready.
    goto backend_ready
)
set /a BACKEND_ATTEMPTS+=1
if !BACKEND_ATTEMPTS! geq 60 goto backend_timeout
powershell -NoProfile -Command "Start-Sleep -Milliseconds 500" >nul 2>&1
goto wait_backend_loop

:backend_timeout
echo.
echo [ERROR] Backend service at http://localhost:8070 failed to respond within 30 seconds.
echo Please check backend container logs using: docker compose logs php nginx
exit /b 1

:backend_ready

if "!DEV_MODE!"=="vite" goto start_vite_mode

REM --------------------------------------------------
REM [3/3] Checking Docker frontend (http://localhost)...
REM --------------------------------------------------
echo [3/3] Waiting for frontend readiness at http://localhost...

set /a FRONTEND_ATTEMPTS=0
:wait_docker_frontend_loop
curl.exe -s -f --connect-timeout 2 --max-time 3 -o nul http://localhost >nul 2>&1
if !errorlevel! equ 0 goto docker_frontend_ready

set /a FRONTEND_ATTEMPTS+=1
if !FRONTEND_ATTEMPTS! geq 30 goto frontend_timeout
powershell -NoProfile -Command "Start-Sleep -Milliseconds 500" >nul 2>&1
goto wait_docker_frontend_loop

:docker_frontend_ready
echo [OK] TPC Alumni application is ready on http://localhost.
echo Opening browser to http://localhost...
start http://localhost
echo.
echo ===================================================
echo   TPC Alumni is running:
echo   Application (Frontend + API): http://localhost
echo   Direct Backend:               http://localhost:8070
echo   phpMyAdmin Database UI:       http://localhost:8080
echo ===================================================
goto end_script

REM --------------------------------------------------
REM Optional Vite Dev Server Mode (--vite)
REM --------------------------------------------------
:start_vite_mode
echo.
echo [DEV MODE] Starting host Vite development server on port 3000...
docker compose stop admin-web >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command "$P='%~dp0'.TrimEnd('\'); ([wmiclass]'win32_process').Create('cmd.exe /k title TPC Alumni - Vite Frontend && cd /d \"' + $P + '\" && npm --prefix admin-web run dev -- --host 0.0.0.0 --port 3000') | Out-Null"

echo Waiting for Vite on http://localhost:3000...
set /a VITE_ATTEMPTS=0
:wait_vite_loop
curl.exe -s -f --connect-timeout 1 -o nul http://localhost:3000 >nul 2>&1
if !errorlevel! equ 0 goto vite_ready

set /a VITE_ATTEMPTS+=1
if !VITE_ATTEMPTS! geq 60 goto frontend_timeout
powershell -NoProfile -Command "Start-Sleep -Milliseconds 500" >nul 2>&1
goto wait_vite_loop

:vite_ready
echo [OK] Vite frontend is ready on http://localhost:3000.
start http://localhost:3000
echo.
echo ===================================================
echo   TPC Alumni (Vite Dev Mode):
echo   Frontend (HMR):               http://localhost:3000
echo   Direct Backend:               http://localhost:8070
echo   phpMyAdmin Database UI:       http://localhost:8080
echo ===================================================
goto end_script

:frontend_timeout
echo.
echo [ERROR] Frontend failed to respond.
echo Please run 'docker compose ps' or check logs.
exit /b 1

:end_script
endlocal
