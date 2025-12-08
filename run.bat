@echo off
echo Starting Docker containers...
docker-compose up -d

echo Waiting for frontend to be ready...
timeout /t 10 /nobreak >nul

:check
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto check
)

start http://localhost:5173

docker-compose logs -f