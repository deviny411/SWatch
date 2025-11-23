@echo off
echo.
echo Resetting Docker containers and volumes...
echo.

echo Stopping containers...
docker-compose down

echo Removing old volumes (this removes old database data)...
docker-compose down -v

echo Starting fresh containers...
docker-compose up -d

echo Waiting for database to start...
timeout /t 10 /nobreak

echo Initializing database schema...
docker exec -i swatch-db psql -U swatch -d safewatch < backend\src\db\schema.sql

echo.
echo ========================================
echo Done! Database reset complete.
echo Now restart your dev server:
echo    npm run dev
echo ========================================
echo.
pause
