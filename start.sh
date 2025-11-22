#!/bin/bash

echo "🚀 Starting SafeWatch Development Environment"
echo "=============================================="
echo ""

# Check Docker
echo "1️⃣ Checking Docker..."
if docker ps | grep -q "swatch-db"; then
    echo "✅ Docker containers running"
else
    echo "⚠️  Starting Docker containers..."
    docker-compose up -d
    sleep 3
fi
echo ""

# Check if database is initialized
echo "2️⃣ Checking database..."
TABLE_COUNT=$(docker exec swatch-db psql -U swatch -d safewatch -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

if [ "$TABLE_COUNT" -gt "0" ]; then
    echo "✅ Database initialized ($TABLE_COUNT tables)"
else
    echo "⚠️  Initializing database..."
    docker exec -i swatch-db psql -U swatch -d safewatch < backend/src/db/schema.sql
fi
echo ""

# Check environment files
echo "3️⃣ Checking environment files..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating backend/.env..."
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Creating frontend/.env.local..."
    cp frontend/.env.example frontend/.env.local
fi
echo "✅ Environment files ready"
echo ""

# Check dependencies
echo "4️⃣ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing dependencies..."
    npm install
else
    echo "✅ Dependencies installed"
fi
echo ""

echo "=============================================="
echo "✅ Everything ready! Now run:"
echo ""
echo "   npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo "=============================================="
