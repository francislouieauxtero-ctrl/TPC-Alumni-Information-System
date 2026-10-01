@echo off
setlocal enabledelayedexpansion
title TPC Alumni Development Environment

REM Usage note:
REM Run start-dev.bat to start the complete local environment.

echo ===================================================
echo   TPC Alumni - Local Development Server Launcher
echo   Run start-dev.bat to start the complete local environment.
echo ===================================================
echo.

cd /d "%~dp0"

REM --------------------------------------------------
REM [0/4] Verifying project directory and dependencies...
REM --------------------------------------------------
if not exist "%~dp0docker-compose.yml" (
    echo [ERROR] Invalid project directory: docker-compose.yml not found.
    echo Please run start-dev.bat from the root of the TPC-Alumni repository.
    exit /b 1
)
if not exist "%~dp0admin-web\package.json" (
    echo [ERROR] Invalid project directory: admin-web\package.json not found.
    echo Please run start-dev.bat from the root of the TPC-Alumni repository.
    exit /b 1
)
if not exist "%~dp0backend\artisan" (
    echo [ERROR] Invalid project directory: backend\artisan not found.
    echo Please run start-dev.bat from the root of the TPC-Alumni repository.
    exit /b 1
)

where node >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Node.js is not installed or not in system PATH.
    echo Please install Node.js v18 or higher to run the Vite frontend.
    exit /b 1
)
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] npm is not installed or not in system PATH.
    echo Please install npm to run the Vite frontend.
    exit /b 1
)

REM --------------------------------------------------
REM [1/4] Checking Docker Engine...
REM --------------------------------------------------
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
echo Waiting for Docker Engine to become ready...

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

REM --------------------------------------------------
REM [2/4] Starting Docker services...
REM --------------------------------------------------
echo [2/4] Starting Docker services...

for /f "tokens=*" %%i in ('docker ps -q -a --filter "name=capstone_admin" 2^>nul') do (
    echo [CLEANUP] Removing stale Docker frontend container capstone_admin...
    docker rm -f capstone_admin >nul 2>&1
)

docker compose up -d
if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Stage 2 failed: Docker services failed to start.
    echo Please check Docker service configuration and try again.
    exit /b 1
)

for /f "tokens=*" %%i in ('docker ps -q --filter "name=capstone_admin" 2^>nul') do (
    docker rm -f capstone_admin >nul 2>&1
)

echo [OK] Backend containers are running. Use start-dev.bat to start the complete local environment.
echo Waiting for backend service (http://localhost:8070)...
set /a BACKEND_ATTEMPTS=0
:wait_backend_loop
curl.exe -s -f --connect-timeout 2 --max-time 4 -o nul http://127.0.0.1:8070/api/departments >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Backend services ready at http://localhost:8070.
    goto backend_ready
)
set /a BACKEND_ATTEMPTS+=1
if !BACKEND_ATTEMPTS! geq 60 goto backend_timeout
if !BACKEND_ATTEMPTS! equ 1 (
    echo Backend is still starting. Please wait...
)
set /a BACKEND_REM=!BACKEND_ATTEMPTS! %% 10
if !BACKEND_REM! equ 0 (
    echo Backend is still starting. Please wait...
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 500" >nul 2>&1
goto wait_backend_loop

:backend_timeout
echo.
echo [ERROR] Stage 2 failed: Backend service at http://localhost:8070 failed to respond within 60 seconds.
echo Please check backend container logs using: docker compose logs php nginx
exit /b 1

:backend_ready
echo.

REM --------------------------------------------------
REM [3/4] Checking and starting Vite frontend...
REM --------------------------------------------------
echo [3/4] Checking Vite frontend...

powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand JABQAHIAbwBnAHIAZQBzAHMAUAByAGUAZgBlAHIAZQBuAGMAZQAgAD0AIAAnAFMAaQBsAGUAbgB0AGwAeQBDAG8AbgB0AGkAbgB1AGUAJwAKACQAYwAgAD0AIABHAGUAdAAtAE4AZQB0AFQAQwBQAEMAbwBuAG4AZQBjAHQAaQBvAG4AIAAtAEwAbwBjAGEAbABQAG8AcgB0ACAAMwAwADAAMAAgAC0AUwB0AGEAdABlACAATABpAHMAdABlAG4AIAAtAEUAcgByAG8AcgBBAGMAdABpAG8AbgAgAFMAaQBsAGUAbgB0AGwAeQBDAG8AbgB0AGkAbgB1AGUACgBpAGYAIAAoAC0AbgBvAHQAIAAkAGMAKQAgAHsAIABlAHgAaQB0ACAAMAAgAH0ACgAkAHAAIAA9ACAAJABjAFsAMABdAC4ATwB3AG4AaQBuAGcAUAByAG8AYwBlAHMAcwAKACQAYwBtAGQAIAA9ACAAKABHAGUAdAAtAEMAaQBtAEkAbgBzAHQAYQBuAGMAZQAgAFcAaQBuADMAMgBfAFAAcgBvAGMAZQBzAHMAIAAtAEYAaQBsAHQAZQByACAAKAAnAFAAcgBvAGMAZQBzAHMASQBkAD0AJwAgACsAIAAkAHAAKQAgAC0ARQByAHIAbwByAEEAYwB0AGkAbwBuACAAUwBpAGwAZQBuAHQAbAB5AEMAbwBuAHQAaQBuAHUAZQApAC4AQwBvAG0AbQBhAG4AZABMAGkAbgBlAAoAaQBmACAAKAAkAGMAbQBkACAALQBtAGEAdABjAGgAIAAnAGEAZABtAGkAbgAtAHcAZQBiACcAIAAtAG8AcgAgACQAYwBtAGQAIAAtAG0AYQB0AGMAaAAgACcAdgBpAHQAZQAnACkAIAB7ACAAZQB4AGkAdAAgADEAMAAgAH0ACgB0AHIAeQAgAHsACgAgACAAIAAgACQAcgAgAD0AIABJAG4AdgBvAGsAZQAtAFcAZQBiAFIAZQBxAHUAZQBzAHQAIAAtAFUAcgBpACAAJwBoAHQAdABwADoALwAvAGwAbwBjAGEAbABoAG8AcwB0ADoAMwAwADAAMAAnACAALQBVAHMAZQBCAGEAcwBpAGMAUABhAHIAcwBpAG4AZwAgAC0AVABpAG0AZQBvAHUAdABTAGUAYwAgADIAIAAtAEUAcgByAG8AcgBBAGMAdABpAG8AbgAgAFMAaQBsAGUAbgB0AGwAeQBDAG8AbgB0AGkAbgB1AGUACgAgACAAIAAgAGkAZgAgACgAJAByAC4AQwBvAG4AdABlAG4AdAAgAC0AbQBhAHQAYwBoACAAJwBhAGQAbQBpAG4ALQB3AGUAYgAnACAALQBvAHIAIAAkAHIALgBDAG8AbgB0AGUAbgB0ACAALQBtAGEAdABjAGgAIAAnAG0AYQBpAG4ALgBqAHMAeAAnACkAIAB7ACAAZQB4AGkAdAAgADEAMAAgAH0ACgB9ACAAYwBhAHQAYwBoACAAewB9AAoAZQB4AGkAdAAgADIAMAA=
set VITE_CHECK_STATUS=!errorlevel!

if !VITE_CHECK_STATUS! equ 10 goto vite_already_running
if !VITE_CHECK_STATUS! equ 20 goto port_occupied_error

echo Starting Vite frontend on http://localhost:3000 (detached process)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$P='%~dp0'.TrimEnd('\'); ([wmiclass]'win32_process').Create('cmd.exe /k title TPC Alumni - Vite Frontend && cd /d \"' + $P + '\" && npm --prefix admin-web run dev -- --host 0.0.0.0 --port 3000') | Out-Null"
echo.
goto wait_frontend_step

:vite_already_running
echo [OK] TPC Alumni Vite frontend is already running on port 3000. Reusing existing process.
goto wait_frontend_step

:port_occupied_error
echo.
echo [ERROR] Port 3000 is already in use by an unrelated process.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; $c=Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if($c){$p=$c[0].OwningProcess; $pr=Get-Process -Id $p -ErrorAction SilentlyContinue; Write-Host ('Occupied by PID: ' + $p + ', Process: ' + $pr.ProcessName)}"
echo Unrelated processes will NOT be terminated automatically.
echo Please free port 3000 or terminate that process before running start-dev.bat.
exit /b 1

REM --------------------------------------------------
REM [4/4] Waiting for frontend...
REM --------------------------------------------------
:wait_frontend_step
echo [4/4] Waiting for frontend readiness at http://localhost:3000...

set /a FRONTEND_ATTEMPTS=0
:wait_frontend_loop
curl.exe -s -f --connect-timeout 1 -o nul http://localhost:3000 >nul 2>&1
if !errorlevel! equ 0 goto frontend_ready

set /a FRONTEND_ATTEMPTS+=1
if !FRONTEND_ATTEMPTS! geq 60 goto frontend_timeout
powershell -NoProfile -Command "Start-Sleep -Milliseconds 500" >nul 2>&1
goto wait_frontend_loop

:frontend_timeout
echo.
echo [ERROR] Stage 4 failed: Frontend server on http://localhost:3000 failed to respond within 30 seconds.
echo Please check the "TPC Alumni - Vite Frontend" console window for the exact error,
echo or run 'npm --prefix admin-web run dev -- --host 0.0.0.0 --port 3000' manually to inspect.
exit /b 1

:frontend_ready
echo [OK] Frontend is ready on http://localhost:3000.
echo Opening browser to http://localhost:3000...
start http://localhost:3000
echo.
echo ===================================================
echo TPC Alumni local server is ready:
echo Frontend:   http://localhost:3000
echo Backend:    http://localhost:8070
echo phpMyAdmin: http://localhost:8080
echo ===================================================

endlocal
