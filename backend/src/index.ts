import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

console.log('🔧 Starting SafeWatch backend...')
dotenv.config()
console.log('✅ Environment variables loaded')
console.log('📝 DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'MISSING!')
console.log('📝 PORT:', process.env.PORT || '4000 (default)')
console.log('📝 JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'MISSING!')

import { authRouter } from './routes/auth.routes'
import { callRouter } from './routes/call.routes'
import { emergencyRouter } from './routes/emergency.routes'
import { watcherRouter } from './routes/watcher.routes'
import { setupSocketHandlers } from './socket'
import { errorHandler } from './middleware/error.middleware'

console.log('✅ All imports loaded successfully')

const app = express()
const server = http.createServer(app)

// Socket.io CORS - allow ngrok, cloudflare tunnel, and vercel domains for testing
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (origin.includes('localhost') || origin.includes('ngrok-free.app') || origin.includes('ngrok.io') || origin.includes('trycloudflare.com') || origin.includes('vercel.app')) {
        return callback(null, true)
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  },
})

// Middleware
app.use(helmet())

// CORS configuration - allow configured origins or ngrok domains for testing
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true)

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Allow ngrok, cloudflare tunnel, and vercel domains for testing
    if (origin.includes('ngrok-free.app') || origin.includes('ngrok.io') || origin.includes('trycloudflare.com') || origin.includes('vercel.app')) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/calls', callRouter)
app.use('/api/emergency', emergencyRouter)
app.use('/api/watchers', watcherRouter)

// Socket.io setup
setupSocketHandlers(io)

// Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.io ready for connections`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
