@echo off
echo.
echo Starting SafeWatch Development Environment
echo ==========================================
echo.

REM Check if Docker is running
echo 1. Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo    Docker is running
echo.

REM Start containers
echo 2. Starting database containers...
docker-compose up -d
timeout /t 3 /nobreak >nul
echo    Containers started
echo.

REM Initialize database
echo 3. Initializing database...
docker exec swatch-db psql -U swatch -d safewatch -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo    Database not ready, waiting...
    timeout /t 3 /nobreak >nul
)

docker exec -i swatch-db psql -U swatch -d safewatch < backend/src/db/schema.sql >nul 2>&1
echo    Database initialized
echo.

REM Create environment files
echo 4. Checking environment files...
if not exist "backend\.env" (
    echo    Creating backend\.env...
    copy backend\.env.example backend\.env >nul
)
if not exist "frontend\.env.local" (
    echo    Creating frontend\.env.local...
    copy frontend\.env.example frontend\.env.local >nul
)
echo    Environment files ready
echo.

REM Check dependencies
echo 5. Checking dependencies...
if not exist "node_modules" (
    echo    Installing dependencies (this may take a while)...
    call npm install
) else (
    echo    Dependencies already installed
)
echo.

echo ==========================================
echo Everything ready! Now run:
echo.
echo    npm run dev
echo.
echo Then visit: http://localhost:3000
echo ==========================================
echo.
pause
