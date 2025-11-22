# SafeWatch (SWatch)

A privacy-first web application MVP designed to prevent drug overdose deaths by connecting people who use drugs alone with trained volunteer watchers via live video/audio calls.

## Core Features

- **Instant Connection**: Real-time video/audio calls with trained watchers
- **Adaptive Streaming**: Automatic fallback to audio-only on low bandwidth
- **Emergency Response**: GPS location sharing and emergency alert system
- **Privacy-First**: No call recordings, anonymous user option
- **Offline Support**: SMS fallback and pre-configured emergency messages
- **Volunteer Management**: Onboarding, training modules, and shift scheduling

## Project Structure

```
SWatch/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared types and utilities
├── package.json       # Root workspace configuration
└── README.md
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Video/Audio**: WebRTC (simple-peer)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Authentication**: JWT

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Run development servers
npm run dev
```

### Development

```bash
# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend

# Run both concurrently
npm run dev
```

## Architecture Principles

1. **Modularity**: Clean separation of concerns
2. **Scalability**: Designed for horizontal scaling
3. **Privacy**: No persistent call data, minimal logging
4. **Reliability**: Offline support and graceful degradation
5. **Simplicity**: Minimal dependencies, clear code structure

## Development Guidelines

- Use TypeScript for type safety
- Follow modular architecture patterns
- Keep components small and focused
- Write self-documenting code
- Prioritize privacy and security
- Test critical paths thoroughly

## License

[To be determined]

## Contact

[To be determined]
