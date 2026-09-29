@echo off
setlocal enabledelayedexpansion
title TPC Alumni Development Environment

echo ===================================================
echo   TPC Alumni - Local Development Server Launcher
echo ===================================================
echo.

cd /d "%~dp0"

:: --------------------------------------------------
:: [1/4] Checking Docker Engine...
:: --------------------------------------------------
echo [1/4] Checking Docker Engine...

docker info >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Docker Engine is running.
    goto docker_ready
)

echo Docker Engine is not running. Attempting to start Docker Desktop...
set "DOCKER_EXE="
if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" set "DOCKER_EXE=C:\Program Files\Docker\Docker\Docker Desktop.exe"
if not defined DOCKER_EXE if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" set "DOCKER_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not defined DOCKER_EXE if exist "%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe" set "DOCKER_EXE=%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe"

if not defined DOCKER_EXE (
    echo.
    echo [ERROR] Stage 1 failed: Docker Desktop executable could not be found.
    echo Please start Docker Desktop manually and run start-dev.bat again.
    exit /b 1
)

echo Starting Docker Desktop from "!DOCKER_EXE!"...
start "" "!DOCKER_EXE!"
echo Waiting for Docker Engine to become ready (up to 60 seconds)...

set /a DOCKER_ATTEMPTS=0
:wait_docker_loop
docker info >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Docker Engine is ready.
    goto docker_ready
)
set /a DOCKER_ATTEMPTS+=1
if !DOCKER_ATTEMPTS! geq 30 goto docker_timeout
powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul 2>&1
goto wait_docker_loop

:docker_timeout
echo.
echo [ERROR] Stage 1 failed: Docker Desktop / Docker Engine could not be started within 60 seconds.
echo Please ensure Docker Desktop is running and try again.
exit /b 1

:docker_ready
echo.

:: --------------------------------------------------
:: [2/4] Starting Docker services...
:: --------------------------------------------------
echo [2/4] Starting Docker services...

for /f "tokens=*" %%i in ('docker ps -q -a --filter "name=capstone_admin" 2^>nul') do (
    echo [CLEANUP] Removing stale Docker frontend container capstone_admin...
    docker rm -f capstone_admin >nul 2>&1
)

docker compose up -d
if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Stage 2 failed: docker compose up -d encountered an error.
    echo Please check Docker service configuration and try again.
    exit /b 1
)

for /f "tokens=*" %%i in ('docker ps -q --filter "name=capstone_admin" 2^>nul') do (
    docker rm -f capstone_admin >nul 2>&1
)

echo Waiting for backend service (http://127.0.0.1:8070/api/departments)...
set /a BACKEND_ATTEMPTS=0
:wait_backend_loop
curl.exe -s -f --connect-timeout 2 -o nul http://127.0.0.1:8070/api/departments >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Backend services ready at http://localhost:8070.
    goto backend_ready
)
set /a BACKEND_ATTEMPTS+=1
if !BACKEND_ATTEMPTS! geq 60 goto backend_timeout
powershell -NoProfile -Command "Start-Sleep -Milliseconds 500" >nul 2>&1
goto wait_backend_loop

:backend_timeout
echo.
echo [ERROR] Stage 2 failed: Backend service at http://127.0.0.1:8070/api/departments failed to respond within 60 seconds.
echo Please check backend container logs using: docker compose logs php nginx
exit /b 1

:backend_ready
echo.

:: --------------------------------------------------
:: [3/4] Starting frontend...
:: --------------------------------------------------
echo [3/4] Starting frontend...

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Vite frontend is already running on port 3000. Skipping duplicate process.
) else (
    echo Starting Vite frontend on http://localhost:3000...
    start "TPC Alumni - Vite Frontend" /d "%~dp0admin-web" cmd /c "npm run dev"
)
echo.

:: --------------------------------------------------
:: [4/4] Waiting for frontend...
:: --------------------------------------------------
echo [4/4] Waiting for frontend...

echo Waiting for frontend readiness at http://localhost:3000...
set /a FRONTEND_ATTEMPTS=0
:wait_frontend_loop
curl.exe -s -f --connect-timeout 1 -o nul http://localhost:3000 >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Frontend is ready on http://localhost:3000.
    goto frontend_ready
)
set /a FRONTEND_ATTEMPTS+=1
if !FRONTEND_ATTEMPTS! geq 120 goto frontend_timeout
powershell -NoProfile -Command "Start-Sleep -Milliseconds 500" >nul 2>&1
goto wait_frontend_loop

:frontend_timeout
echo.
echo [ERROR] Stage 4 failed: Frontend server on http://localhost:3000 failed to respond within 60 seconds.
echo Please check the frontend console window or run 'npm run dev' inside admin-web manually.
exit /b 1

:frontend_ready
echo Opening browser to http://localhost:3000...
start http://localhost:3000
echo.
echo ===================================================
echo TPC Alumni local server is ready:
echo http://localhost:3000
echo ===================================================

endlocal
