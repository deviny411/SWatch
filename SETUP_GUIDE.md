# Quick Start Guide - Environment Setup

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed

## Step 1: Start the Databases

The easiest way is to use the included Docker Compose setup:

```bash
# Start PostgreSQL and Redis in the background
docker-compose up -d

# Check they're running
docker ps
```

You should see two containers running: `swatch-db` and `swatch-redis`.

## Step 2: Set Up Environment Variables

### Backend Environment (.env)

Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with these values:

```env
# Server
PORT=4000
NODE_ENV=development

# Database - These match docker-compose.yml
DATABASE_URL=postgresql://swatch:swatch_dev_password@localhost:5432/safewatch

# Redis - Default local Redis
REDIS_URL=redis://localhost:6379

# JWT - Generate a random secret for development
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS - Allow your frontend
ALLOWED_ORIGINS=http://localhost:3000

# Emergency Services (Optional for now - leave empty)
EMERGENCY_SMS_PROVIDER=
EMERGENCY_API_KEY=
```

### Frontend Environment (.env.local)

Copy the example file:
```bash
cp frontend/.env.example frontend/.env.local
```

Content:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Step 3: Initialize the Database

```bash
# Install PostgreSQL client (if not installed)
# macOS:
brew install postgresql

# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Windows: Use Docker exec instead (see below)

# Run the schema
psql postgresql://swatch:swatch_dev_password@localhost:5432/safewatch -f backend/src/db/schema.sql
```

**Alternative (if psql not installed):**
```bash
# Use Docker to run the schema
docker exec -i swatch-db psql -U swatch -d safewatch < backend/src/db/schema.sql
```

## Step 4: Install Dependencies and Start

```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev
```

## Verification

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Troubleshooting

### Database connection fails
```bash
# Check if containers are running
docker ps

# Restart containers
docker-compose restart

# View logs
docker-compose logs postgres
```

### Need to reset the database
```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Re-run schema
docker exec -i swatch-db psql -U swatch -d safewatch < backend/src/db/schema.sql
```

### Generate a secure JWT secret
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## What Each Service Does

- **PostgreSQL**: Stores all persistent data (users, calls, emergency alerts, etc.)
- **Redis**: Handles sessions, temporary data, and pub/sub for real-time features
- **Backend**: Express API server + Socket.io for WebRTC signaling
- **Frontend**: Next.js web application

## Production Notes

For production, you'll need:
- Managed PostgreSQL (AWS RDS, Supabase, etc.)
- Managed Redis (AWS ElastiCache, Redis Cloud, etc.)
- Secure JWT_SECRET
- HTTPS endpoints
- Rate limiting
- SMS provider credentials (Twilio, etc.)
