# SafeWatch - Technical Documentation

## Project Overview

SafeWatch is an overdose prevention application that connects individuals using substances with trained volunteers (watchers) through real-time video calls. The platform enables immediate emergency response and provides watchers with critical information to identify overdose symptoms.

---

## Tech Stack

### Frontend
- **Next.js 14** - React framework for server-side rendering and routing
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Socket.IO Client** - Real-time bidirectional communication
- **Simple-Peer** - WebRTC library for peer-to-peer video/audio streaming

### Backend
- **Node.js** - JavaScript runtime for server-side code
- **Express.js** - Web application framework for REST API
- **TypeScript** - Type safety across the entire codebase
- **Socket.IO** - Real-time WebSocket server for signaling and matching
- **PostgreSQL** - Relational database for persistent data
- **JWT** - Stateless authentication tokens

### Deployment
- **Vercel** - Frontend hosting with automatic deployments
- **Railway** - Backend and database hosting with CI/CD
- **npm Workspaces** - Monorepo structure for shared code

### Development Tools
- **tsconfig-paths** - Runtime TypeScript path resolution for monorepo
- **ESLint** - Code quality and consistency
- **Git** - Version control

---

## Architecture Overview

### Monorepo Structure
```
SWatch/
├── frontend/          # Next.js application
├── backend/           # Express + Socket.IO server
└── shared/            # Shared TypeScript types
```

**Why Monorepo?**
- Share TypeScript types between frontend and backend
- Single source of truth for data models
- Easier refactoring and consistency
- Simplified dependency management

### Communication Flow
```
User (Browser) ←→ Vercel (Frontend) ←→ Railway (Backend) ←→ PostgreSQL
                           ↑
                      Socket.IO
                           ↓
                    WebRTC Signaling
```

---

## Features & Implementation

### 1. Anonymous Authentication

**What it does:** Users can join as either "Seeking Help" or "Watcher" without creating accounts.

**How it works:**
1. Frontend sends anonymous login request to `/api/auth/login/anonymous`
2. Backend creates a user record in PostgreSQL with a UUID
3. JWT token generated and returned to client
4. Token stored in React Context for subsequent requests

**Files:**
- `backend/src/controllers/auth.controller.ts` - Authentication logic
- `backend/src/services/auth.service.ts` - Token generation
- `frontend/src/contexts/AuthContext.tsx` - Client-side auth state
- `frontend/src/app/login/page.tsx` - Login UI with role selection

**Why JWT?**
- Stateless authentication (no session storage needed)
- Works well with REST APIs
- Easy to verify on both HTTP and WebSocket connections

---

### 2. Real-Time Matching Queue

**What it does:** Users seeking help join a queue and are matched with available watchers in real-time.

**How it works:**
1. User clicks "Seeking Help" → redirected to `/seek-help`
2. Frontend emits `seek-help:join` socket event with user ID
3. Backend adds user to in-memory Map (waiting queue)
4. Backend broadcasts `watcher:queue-update` to all connected watchers
5. Watcher sees user in dashboard and clicks "Accept"
6. Backend creates call, assigns watcher, notifies both users
7. Both users redirected to call page with `remoteUserId` in URL params

**Files:**
- `backend/src/socket/matching.socket.ts` - Queue management and matching logic
- `frontend/src/app/seek-help/page.tsx` - Waiting UI for users
- `frontend/src/app/dashboard/page.tsx` - Queue display for watchers

**Data Flow:**
```
User: seek-help:join → Backend adds to queue → watcher:queue-update broadcast
Watcher: watcher:accept-user → Backend creates call → seek-help:matched & watcher:match-success
Both: Redirected to /call/:callId?remoteUserId=X&isInitiator=Y
```

**Why in-memory queue?**
- Fast read/write for real-time matching
- No database overhead for temporary queue state
- Simple implementation for MVP
- Queue cleared on disconnect automatically

---

### 3. WebRTC Video Calling

**What it does:** Enables peer-to-peer video and audio calls between users and watchers.

**How it works:**

**Initialization:**
1. Both users land on `/call/:callId` with URL params
2. Frontend requests camera/microphone permissions
3. `useMediaStream` hook captures local video/audio stream
4. `useWebRTC` hook initializes SimplePeer connection
5. User (initiator=true) creates WebRTC offer
6. Watcher (initiator=false) waits for offer

**Signaling (Offer/Answer Exchange):**
1. SimplePeer generates offer/answer/ICE candidates
2. Frontend emits `call:signal` to backend via Socket.IO
3. Backend looks up target user's socket ID in `userSocketMap`
4. Backend forwards signal to target user's socket
5. Target user's SimplePeer processes signal
6. WebRTC connection established directly between browsers

**Media Streaming:**
1. Once connected, SimplePeer sends local stream to peer
2. Remote stream received via `stream` event
3. Frontend attaches stream to video element
4. Audio/video controls toggle tracks on local stream

**Files:**
- `frontend/src/hooks/useWebRTC.ts` - WebRTC peer management
- `frontend/src/hooks/useMediaStream.ts` - Camera/mic access
- `backend/src/socket/call.socket.ts` - Signaling server
- `frontend/src/app/call/[callId]/page.tsx` - Call UI

**Why WebRTC?**
- Peer-to-peer = lower server costs (no video relay needed)
- Low latency for real-time interaction
- Built into all modern browsers
- Secure (encrypted media streams)

**Why Socket.IO for signaling?**
- Already using it for matching queue
- Easier than implementing pure WebSocket protocol
- Automatic reconnection and fallback transports
- Room-based routing for targeted messages

---

### 4. Emergency Response System

**What it does:** Watchers can trigger emergency alerts that notify emergency services and the user.

**How it works:**
1. Watcher sees emergency button (top center, pulsing red)
2. Clicks button → confirmation dialog explains what will happen
3. Frontend emits `call:emergency` socket event
4. Frontend also POSTs to `/api/calls/:callId/emergency` (redundant safety)
5. Backend marks call as EMERGENCY in database
6. Backend emits `call:emergency-triggered` to both users' sockets
7. User sees alert: "Emergency services notified. Help is on the way!"
8. Button changes to "EMERGENCY ACTIVE" (disabled, orange)

**Files:**
- `frontend/src/app/call/[callId]/page.tsx` - Emergency button and handler
- `backend/src/socket/call.socket.ts` - Emergency socket handler
- `backend/src/controllers/call.controller.ts` - Emergency HTTP endpoint
- `backend/src/services/call.service.ts` - Database update

**Database Changes:**
```sql
UPDATE calls
SET emergency_triggered = true,
    status = 'EMERGENCY'
WHERE id = :callId
```

**Why both Socket.IO and HTTP?**
- Socket.IO for instant notification to both users
- HTTP POST for reliable database update
- Redundancy ensures emergency is recorded even if socket fails

---

### 5. Overdose Symptoms Sidebar

**What it does:** Provides watchers with quick reference guide for identifying overdose symptoms.

**How it works:**
1. Toggle button in top-left corner (watchers only)
2. Sidebar slides in from left with smooth CSS transition
3. Semi-transparent background (60% opacity + backdrop blur)
4. Scrollable content with three sections:
   - 🚨 Critical Signs (red) - requires immediate 911 call
   - ⚠️ Warning Signs (yellow) - early indicators
   - ✅ What To Do (green) - step-by-step instructions

**Files:**
- `frontend/src/app/call/[callId]/page.tsx` - Sidebar component and toggle

**Implementation Details:**
```tsx
const [showSymptomsSidebar, setShowSymptomsSidebar] = useState(false)

// Toggle button
<button onClick={() => setShowSymptomsSidebar(!showSymptomsSidebar)}>
  📋 Symptoms
</button>

// Sidebar with slide animation
<div className={`
  absolute top-0 left-0 h-full w-72
  bg-black bg-opacity-60 backdrop-blur-sm
  transition-transform duration-300
  ${showSymptomsSidebar ? 'translate-x-0' : '-translate-x-full'}
`}>
```

**Why on the left?**
- Right side has picture-in-picture video of watcher
- Left side keeps critical info visible without blocking camera
- Natural reading flow (left to right)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'USER',
  status VARCHAR(50) DEFAULT 'OFFLINE',
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);
```

### Calls Table
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  watcher_id UUID REFERENCES watchers(id),
  status VARCHAR(50) DEFAULT 'PENDING',
  type VARCHAR(50) DEFAULT 'VIDEO',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  emergency_triggered BOOLEAN DEFAULT false
);
```

### Watchers Table
```sql
CREATE TABLE watchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
  training_completed BOOLEAN DEFAULT false,
  background_check_completed BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  max_concurrent_calls INTEGER DEFAULT 5,
  current_call_count INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  total_hours DECIMAL DEFAULT 0,
  emergencies_handled INTEGER DEFAULT 0,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Why separate Watchers table?**
- Store watcher-specific metadata (certifications, stats, availability)
- Support future features (scheduling, ratings, training progress)
- Allow users to switch between seeking help and being watchers

---

## Key Technical Decisions

### 1. Why Monorepo with Shared Types?

**Problem:** Frontend and backend need to agree on data structures (Call, User, etc.)

**Solution:** Shared TypeScript package (`@safewatch/shared`)
- Single source of truth for types
- Compile-time type checking across full stack
- Automatic IDE autocomplete for API responses

**Example:**
```typescript
// shared/src/types/call.types.ts
export interface Call {
  id: string;
  userId: string;
  watcherId?: string;
  status: CallStatus;
  type: CallType;
  startedAt: Date;
  emergencyTriggered: boolean;
}

// Used in both:
// backend/src/services/call.service.ts
// frontend/src/app/call/[callId]/page.tsx
```

---

### 2. Why URL Params for Call Setup?

**Problem:** WebRTC needs `remoteUserId` and `isInitiator` to establish connection.

**Initial Approach (Failed):** Fetch call from database, extract watcher info.
- Complex lookups (calls → watchers → user_id)
- Race conditions (database not updated yet)
- Multiple potential failure points

**Current Approach (Works):** Pass via URL parameters.
```
/call/:callId?remoteUserId=abc123&isInitiator=true
```

**Benefits:**
- Immediate availability (no async fetch needed)
- Works exactly like proven test call flow
- Simpler code, fewer bugs
- No database dependency for WebRTC setup

---

### 3. Why In-Memory Queue vs Database Queue?

**In-Memory (Current):**
- Pros: Fast, simple, real-time updates
- Cons: Lost on server restart, doesn't scale horizontally

**Database Queue:**
- Pros: Persistent, scalable, audit trail
- Cons: Slower, more complex, polling or triggers needed

**Decision:** In-memory for MVP, database for production.

---

### 4. Why Socket.IO Instead of Pure WebSockets?

**Socket.IO Advantages:**
- Automatic reconnection
- Fallback transports (long-polling if WebSocket blocked)
- Room-based routing (easy to target specific users)
- Built-in event system
- Compatible with WebRTC signaling patterns

**Trade-offs:**
- Slightly larger bundle size
- More abstraction than raw WebSocket

**Decision:** Benefits outweigh costs for this use case.

---

## Deployment Architecture

### Frontend (Vercel)
```
GitHub Push → Vercel Build → Deploy to CDN
- Automatic builds on git push
- Environment variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
- Edge network for low latency
```

### Backend (Railway)
```
GitHub Push → Railway Build → Deploy to Container
- Automatic builds on git push
- Environment variables: DATABASE_URL, JWT_SECRET, PORT
- PostgreSQL add-on in same project
- Persistent storage for database
```

### CORS Configuration
```typescript
// Backend allows Vercel domains
origin: (origin, callback) => {
  if (origin.includes('vercel.app') ||
      origin.includes('localhost')) {
    callback(null, true)
  }
}
```

---

## Error Handling & Edge Cases

### 1. Duplicate Socket Connections
**Problem:** User refreshes page → multiple sockets → signals sent to wrong socket

**Solution:**
```typescript
// Overwrite old mapping when new socket connects
socketUserMap.set(socket.id, userId)
userSocketMap.set(userId, socket.id) // Latest socket wins
```

### 2. User Disconnects During Call
**Problem:** Other user stuck in call with dead connection

**Solution:**
```typescript
socket.on('disconnect', async () => {
  const activeCall = await callService.getActiveCallForUser(userId)
  if (activeCall) {
    // End call and notify other user
    await callService.endCall(activeCall.id)
    io.to(otherUserSocket).emit('call:ended', { reason: 'disconnect' })
  }
})
```

### 3. Camera/Mic Permission Denied
**Problem:** User denies permissions → call fails silently

**Solution:**
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
} catch (err) {
  alert('Camera/microphone access required for video calls')
  router.push('/dashboard')
}
```

### 4. WebRTC Connection Fails
**Problem:** Firewall blocks WebRTC → stuck on "connecting"

**Solution (Implemented):** Debug logs to identify issue
**Solution (TODO):** TURN server for relay when P2P fails

---

## Performance Optimizations

### 1. Lazy Loading Video Components
```typescript
// Only load WebRTC when actually in call
const { remoteStream } = useWebRTC({
  callId,
  localStream,
  remoteUserId,
})
```

### 2. Socket Connection Pooling
```typescript
// Reuse same Socket.IO connection across app
const socket = getSocket() // Singleton pattern
```

### 3. Debounced Queue Updates
```typescript
// Don't spam queue updates on every join/leave
const broadcastQueueUpdate = debounce(() => {
  io.emit('watcher:queue-update', { queue })
}, 500)
```

### 4. Video Element Optimization
```typescript
<video
  autoPlay      // Start immediately
  playsInline   // Don't fullscreen on iOS
  muted={isLocal} // Prevent audio feedback
/>
```

---

## Security Considerations

### 1. JWT Token Security
- Tokens stored in memory (React Context), not localStorage
- 7-day expiration
- Signed with secret key (environment variable)

### 2. Database Queries
- Parameterized queries prevent SQL injection
```typescript
query('SELECT * FROM users WHERE id = $1', [userId])
```

### 3. CORS Restrictions
- Only allow specific domains (Vercel, localhost)
- Credentials required for cross-origin requests

### 4. WebRTC Security
- End-to-end encrypted media streams (built into WebRTC)
- STUN servers only (no media relay through server)

---

## Testing Strategy (for Production)

### Unit Tests
- `auth.service.ts` - Token generation and validation
- `call.service.ts` - Call lifecycle management
- `useWebRTC.ts` - WebRTC connection logic

### Integration Tests
- Matching flow (user joins → watcher accepts → call created)
- Emergency trigger (button click → database update → notification)
- Call ending (disconnect → cleanup → routing)

### End-to-End Tests
- Full user flow: Login → Join queue → Match → Video call → Emergency → End
- Test with actual WebRTC connections
- Verify Socket.IO event delivery

---

## Future Enhancements

### Scalability
- [ ] Redis for distributed queue (multiple backend servers)
- [ ] TURN server for WebRTC relay (firewall bypass)
- [ ] Database indexing on frequently queried fields

### Features
- [ ] Text chat during calls
- [ ] Screen sharing for sharing location/info
- [ ] Call recording (with consent) for training
- [ ] Watcher scheduling and shift management
- [ ] User feedback and ratings

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic)
- [ ] Call quality metrics (WebRTC stats)
- [ ] Usage analytics (PostHog)

---

## Troubleshooting Guide

### "Call stuck on connecting"
1. Check browser console for `remoteUserId` value
2. Verify Socket.IO connection (`isConnected: true`)
3. Check backend logs for signal routing
4. Ensure both users have camera/mic permissions

### "No video/audio"
1. Check `localStream` is not null
2. Verify video element has `srcObject` set
3. Check browser console for getUserMedia errors
4. Try different browser (WebRTC compatibility)

### "Emergency button not working"
1. Check `isInitiator` value (should be false for watcher)
2. Verify Socket.IO connection active
3. Check backend logs for emergency event
4. Ensure database update succeeded

---

## Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Database (if local)
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
```

### Making Changes
1. Update shared types in `shared/src/types/`
2. Backend changes in `backend/src/`
3. Frontend changes in `frontend/src/`
4. Test locally with two browser windows
5. Commit and push (triggers auto-deploy)

### Debugging
- Backend logs: Railway dashboard → Deployments → Logs
- Frontend errors: Browser DevTools console
- Socket.IO events: Add console.log in socket handlers
- Database queries: Check Railway PostgreSQL logs

---

## Conclusion

SafeWatch demonstrates a complete real-time video calling platform built with modern web technologies. The architecture prioritizes:

- **Reliability** - Redundant emergency notifications, automatic reconnection
- **Performance** - Peer-to-peer video, in-memory queue, optimized rendering
- **Developer Experience** - TypeScript everywhere, shared types, clear separation of concerns
- **User Experience** - Simple onboarding, intuitive UI, instant matching

The modular design allows for easy extension and scaling as the platform grows.

---

**Built by:** Claude & User
**Last Updated:** November 2025
**Version:** 1.0 (MVP)
