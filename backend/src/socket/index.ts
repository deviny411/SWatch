import { Server, Socket } from 'socket.io'
import { handleCallEvents } from './call.socket'
import { handleEmergencyEvents } from './emergency.socket'

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Handle authentication
    const token = socket.handshake.auth.token
    if (!token) {
      console.log('No token provided, disconnecting')
      socket.disconnect()
      return
    }

    // TODO: Verify JWT token and attach user info to socket

    // Register event handlers
    handleCallEvents(io, socket)
    handleEmergencyEvents(io, socket)

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })
}
