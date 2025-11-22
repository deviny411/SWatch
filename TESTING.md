# SafeWatch - Testing Guide

This guide will help you test the authentication system and verify everything is working.

## Prerequisites

Make sure you have:
1. ✅ Docker Desktop running
2. ✅ PostgreSQL and Redis containers started
3. ✅ Environment files configured

## Quick Start

### 1. Start the Database (if not already running)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Initialize the database schema (only needed once)
docker exec -i swatch-db psql -U swatch -d safewatch < backend/src/db/schema.sql
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:3000

## Testing Authentication

### Test 1: Register a New User

1. Open http://localhost:3000
2. Click "Create Account"
3. Fill in the form:
   - Phone: `+1234567890` (any format)
   - Password: `password123` (min 6 chars)
   - Confirm password
4. Click "Create Account"
5. You should be redirected to the dashboard showing your user info

**What this tests:**
- ✅ Frontend → Backend API communication
- ✅ PostgreSQL database write operations
- ✅ Password hashing with bcrypt
- ✅ JWT token generation
- ✅ User creation in database
- ✅ Default preferences created

### Test 2: Logout and Login

1. From the dashboard, click "Logout"
2. You should be redirected to the home page
3. Click "Get Started"
4. Enter your credentials:
   - Phone: `+1234567890`
   - Password: `password123`
5. Click "Sign In"
6. You should be back at the dashboard with the same user info

**What this tests:**
- ✅ User lookup by phone number
- ✅ Password verification
- ✅ JWT token validation
- ✅ Session persistence

### Test 3: Anonymous User

1. If logged in, logout first
2. Go to login page
3. Click "Continue Anonymously"
4. You should see the dashboard with:
   - A different user ID
   - Account Type: "🔒 Anonymous"
   - No phone number

**What this tests:**
- ✅ Anonymous user creation
- ✅ Privacy-first mode working
- ✅ Different user IDs for each session

### Test 4: Session Persistence

1. Log in (registered or anonymous)
2. Refresh the page (F5)
3. You should still be logged in on the dashboard

**What this tests:**
- ✅ localStorage token storage
- ✅ Token verification on page load
- ✅ GET /api/auth/me endpoint

### Test 5: Protected Routes

1. Open a new incognito/private browser window
2. Try to access http://localhost:3000/dashboard directly
3. You should be redirected to the login page

**What this tests:**
- ✅ Route protection working
- ✅ Authentication middleware

## Checking the Database

### View users in PostgreSQL

```bash
# Connect to PostgreSQL
docker exec -it swatch-db psql -U swatch -d safewatch

# Run SQL queries
SELECT id, role, status, is_anonymous, phone_number, created_at FROM users;

# View user preferences
SELECT * FROM user_preferences;

# Exit
\q
```

You should see:
- Your registered user with phone number
- Anonymous users (if you tested that)
- User preferences for each user

## Backend API Testing (Optional)

Test the backend directly using curl:

### Register via API
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1999999999","password":"test123"}'
```

### Login via API
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1999999999","password":"test123"}'
```

### Get User Info (replace TOKEN with actual token from login)
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Health Check
```bash
curl http://localhost:4000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Common Issues

### "Connection refused" error
- Make sure backend is running on port 4000
- Check: `npm run dev:backend` or `npm run dev`

### "Database connection failed"
- Make sure Docker containers are running: `docker ps`
- Restart: `docker-compose restart`

### "User already exists" error
- Try a different phone number
- Or delete the user from database

### Frontend shows blank page
- Check browser console for errors (F12)
- Make sure frontend is running on port 3000

### Token errors
- Clear localStorage: Open browser console, run `localStorage.clear()`
- Logout and login again

## What's Been Tested

✅ **Phase 1.1 - Database Models**
- User model CRUD operations
- PostgreSQL connection working
- Type-safe queries

✅ **Phase 1.2 - Authentication**
- User registration
- User login
- Anonymous user creation
- JWT token generation
- Password hashing
- Token verification

✅ **Frontend Integration**
- Login UI
- Register UI
- Dashboard UI
- AuthContext state management
- API client
- Protected routes
- Session persistence

## Next Steps

Once you've confirmed everything above works:

1. **Ready for Phase 2**: WebRTC Video Calling
2. **Or Phase 3**: Emergency Alert System
3. **Or complete Phase 1.3**: User Profile Management

Let me know what works and what doesn't!
