@echo off
setlocal
title TPC Alumni Development Environment

echo ===================================================
echo   TPC Alumni - Local Development Server Launcher
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Ensuring Docker backend services are running...
docker compose up -d
if errorlevel 1 (
    echo [WARNING] Docker Compose encountered an issue. Please ensure Docker Desktop is running.
) else (
    echo [OK] Backend services ready at http://localhost:8070.
)
echo.

echo [2/3] Waiting for frontend readiness before launching browser...
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "$port = 3000; for ($i = 0; $i -lt 120; $i++) { if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { Start-Sleep -Milliseconds 300; Start-Process 'http://localhost:3000'; exit 0 }; Start-Sleep -Milliseconds 500 }; Start-Process 'http://localhost:3000'"
echo.

echo [3/3] Starting Vite frontend on http://localhost:3000...
echo Press Ctrl+C to stop the development server.
echo.
cd /d "%~dp0admin-web"
npm run dev

endlocal
