import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.routes'
import { callRouter } from './routes/call.routes'
import { emergencyRouter } from './routes/emergency.routes'
import { watcherRouter } from './routes/watcher.routes'
import { setupSocketHandlers } from './socket'
import { errorHandler } from './middleware/error.middleware'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
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
