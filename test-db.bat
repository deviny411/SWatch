@echo off
echo Testing database connection...
echo.
cd backend
npm run test-db
cd ..
pause
