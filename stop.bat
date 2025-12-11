@echo off
echo Stopping Docker containers...
docker-compose stop

echo.
echo All containers have been stopped.
echo Your data has been preserved.
echo.
echo To start the application again, run: run.bat