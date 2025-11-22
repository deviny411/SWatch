#!/bin/bash

# SafeWatch - Quick Setup Script
# This script sets up your development environment

set -e

echo "🚀 SafeWatch Development Environment Setup"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start PostgreSQL and Redis
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 5

# Check if databases are healthy
echo "🔍 Checking database health..."
if docker-compose ps | grep -q "unhealthy"; then
    echo "❌ Error: Databases are not healthy. Check docker-compose logs."
    docker-compose logs
    exit 1
fi

echo "✅ Databases are running"
echo ""

# Set up backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/.env.example backend/.env

    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)

    # Replace the JWT secret in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/dev-secret-change-in-production-use-openssl-rand/$JWT_SECRET/" backend/.env
    else
        # Linux
        sed -i "s/dev-secret-change-in-production-use-openssl-rand/$JWT_SECRET/" backend/.env
    fi

    echo "✅ Backend .env created with secure JWT secret"
else
    echo "⏭️  backend/.env already exists, skipping..."
fi

echo ""

# Set up frontend .env.local if it doesn't exist
if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend/.env.local file..."
    cp frontend/.env.example frontend/.env.local
    echo "✅ Frontend .env.local created"
else
    echo "⏭️  frontend/.env.local already exists, skipping..."
fi

echo ""

# Initialize database schema
echo "🗄️  Initializing database schema..."
docker exec -i swatch-db psql -U swatch -d safewatch < backend/src/db/schema.sql

echo "✅ Database schema initialized"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You're all set! To start developing:"
echo ""
echo "   npm run dev"
echo ""
echo "Then visit:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000/health"
echo ""
echo "To stop the databases:"
echo "   docker-compose down"
echo ""
