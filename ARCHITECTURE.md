# SafeWatch Architecture

## Overview

SafeWatch is built as a monorepo with three main packages:
- `frontend/`: Next.js web application
- `backend/`: Node.js/Express API server
- `shared/`: Shared TypeScript types and utilities

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Socket.io Client**: Real-time communication
- **simple-peer**: WebRTC wrapper for video/audio

### Backend
- **Express**: Web server framework
- **Socket.io**: WebSocket server for real-time events
- **PostgreSQL**: Primary database
- **Redis**: Session storage and pub/sub
- **JWT**: Authentication tokens

## Architecture Patterns

### Modular Design
Each feature is organized into self-contained modules:
- Controllers: Handle HTTP requests
- Routes: Define API endpoints
- Socket handlers: Manage real-time events
- Services: Business logic (to be implemented)
- Models: Database interactions (to be implemented)

### Real-time Communication

```
User <-> WebRTC <-> Watcher
  |                    |
  v                    v
Socket.io Client   Socket.io Client
  |                    |
  +-----> Socket.io Server <------+
            |
            v
      Call Coordination
      Emergency Alerts
```

### Privacy-First Design

1. **No Call Recording**: Video/audio streams are peer-to-peer only
2. **Anonymous Mode**: Users can connect without providing personal info
3. **Minimal Logging**: Only essential data is stored
4. **Automatic Cleanup**: Session data is ephemeral

## Data Flow

### Call Flow
1. User requests watcher
2. Backend finds available watcher
3. Socket.io establishes signaling channel
4. WebRTC peer connection created
5. Direct video/audio stream between peers
6. Backend monitors call status only

### Emergency Flow
1. Watcher/User triggers emergency
2. Backend creates alert record
3. Location data captured
4. SMS sent to emergency services
5. Admin/coordinators notified
6. Status tracked until resolved

## Database Schema

Key entities:
- `users`: Both users and watchers
- `watchers`: Watcher-specific data
- `calls`: Call session records
- `emergency_alerts`: Emergency events
- `shifts`: Watcher availability

See `backend/src/db/schema.sql` for full schema.

## Security Considerations

1. **Authentication**: JWT tokens with secure secrets
2. **Authorization**: Role-based access control
3. **Input Validation**: All user input sanitized
4. **HTTPS Only**: In production
5. **Rate Limiting**: To be implemented
6. **CORS**: Restricted origins

## Scalability

### Horizontal Scaling
- Stateless API servers
- Redis for shared state
- PostgreSQL with read replicas
- Load balancer for distribution

### WebRTC Scaling
- TURN servers for NAT traversal
- Selective Forwarding Unit (SFU) for group calls (future)
- Edge servers for low latency (future)

## Development Workflow

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build
```

## Testing Strategy (To be implemented)

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: API endpoints and socket events
3. **E2E Tests**: Complete user flows
4. **Load Tests**: Performance under load

## Deployment (To be implemented)

- Frontend: Vercel/Netlify
- Backend: Docker containers on AWS/GCP
- Database: Managed PostgreSQL
- Redis: Managed Redis cluster
- CDN: CloudFront/Cloudflare

## Monitoring (To be implemented)

- Application metrics
- Error tracking
- Performance monitoring
- Uptime monitoring
- Alert notifications
