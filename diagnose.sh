#!/bin/bash

echo "🔍 SafeWatch Diagnostic Tool"
echo "=============================="
echo ""

# Check if Docker is running
echo "1. Checking Docker..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is NOT running - Please start Docker Desktop!"
    exit 1
fi
echo ""

# Check containers
echo "2. Checking Database Containers..."
if docker ps | grep -q "swatch-db"; then
    echo "✅ PostgreSQL container is running"
else
    echo "❌ PostgreSQL container is NOT running"
    echo "   Run: docker-compose up -d"
fi

if docker ps | grep -q "swatch-redis"; then
    echo "✅ Redis container is running"
else
    echo "❌ Redis container is NOT running"
    echo "   Run: docker-compose up -d"
fi
echo ""

# Check if backend node_modules exist
echo "3. Checking Dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies missing"
    echo "   Run: npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies missing"
    echo "   Run: npm install"
fi
echo ""

# Check environment files
echo "4. Checking Environment Files..."
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
else
    echo "⚠️  backend/.env missing"
    echo "   Run: cp backend/.env.example backend/.env"
fi

if [ -f "frontend/.env.local" ]; then
    echo "✅ frontend/.env.local exists"
else
    echo "⚠️  frontend/.env.local missing"
    echo "   Run: cp frontend/.env.example frontend/.env.local"
fi
echo ""

# Test database connection
echo "5. Testing Database Connection..."
if docker exec swatch-db psql -U swatch -d safewatch -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection working"

    # Check if tables exist
    TABLE_COUNT=$(docker exec swatch-db psql -U swatch -d safewatch -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo "✅ Database tables exist ($TABLE_COUNT tables)"
    else
        echo "❌ Database tables missing!"
        echo "   Run: docker exec -i swatch-db psql -U swatch -d safewatch < backend/src/db/schema.sql"
    fi
else
    echo "❌ Cannot connect to database"
fi
echo ""

# Test backend health
echo "6. Testing Backend Server..."
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Backend server is running and responding"
    HEALTH=$(curl -s http://localhost:4000/health)
    echo "   Response: $HEALTH"
else
    echo "❌ Backend server is NOT responding on http://localhost:4000"
    echo "   Run: npm run dev:backend"
fi
echo ""

# Test frontend
echo "7. Testing Frontend Server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend server is running"
else
    echo "❌ Frontend server is NOT responding on http://localhost:3000"
    echo "   Run: npm run dev:frontend"
fi
echo ""

echo "=============================="
echo "Diagnostic complete!"
echo ""
echo "Next steps:"
echo "1. Fix any ❌ issues above"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
