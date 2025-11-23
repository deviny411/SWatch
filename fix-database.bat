@echo off
echo ========================================
echo SafeWatch - Database Fix Script
echo ========================================
echo.
echo This script will:
echo 1. Stop all containers
echo 2. Remove old volumes (clearing cached passwords)
echo 3. Start fresh containers
echo 4. Initialize database schema
echo 5. Test database connection
echo.
pause

echo.
echo [1/5] Stopping containers...
docker-compose down
echo.

echo [2/5] Removing volumes to clear old data...
docker volume rm swatch_postgres_data 2>nul
docker volume rm swatch_redis_data 2>nul
echo Volumes removed (or didn't exist)
echo.

echo [3/5] Starting fresh containers...
docker-compose up -d
echo.

echo [4/5] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul
echo.

echo [5/5] Testing database connection...
docker exec swatch-db psql -U swatch -d safewatch -c "SELECT version();"
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database is working.
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Run: cd backend
    echo 2. Run: npm run init-db
    echo 3. Run: cd ..
    echo 4. Run: npm run dev
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Database connection failed.
    echo ========================================
    echo.
    echo Please check:
    echo 1. Is Docker Desktop running?
    echo 2. Check backend/.env file exists
    echo 3. Check logs: docker-compose logs postgres
    echo.
)

pause
