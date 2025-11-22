import { Server, Socket } from 'socket.io'
import { WebRTCSignal, CallStatus } from '@shared/types'

export const handleCallEvents = (io: Server, socket: Socket) => {
  // Handle call request from user
  socket.on('call:request', async (data: { type: 'video' | 'audio' }) => {
    try {
      console.log(`Call request from ${socket.id}`, data)
      // TODO: Find available watcher
      // TODO: Create call session
      // TODO: Notify watcher
    } catch (error) {
      socket.emit('call:error', { message: 'Failed to request call' })
    }
  })

  // Handle watcher accepting call
  socket.on('call:accept', async (data: { callId: string }) => {
    try {
      console.log(`Call accepted by ${socket.id}`, data)
      // TODO: Update call status
      // TODO: Notify user
    } catch (error) {
      socket.emit('call:error', { message: 'Failed to accept call' })
    }
  })

  // Handle WebRTC signaling
  socket.on('call:signal', (signal: WebRTCSignal) => {
    console.log(`WebRTC signal from ${socket.id}`)
    // Forward signal to the other peer
    io.to(signal.to).emit('call:signal', signal)
  })

  // Handle call end
  socket.on('call:end', async (data: { callId: string }) => {
    try {
      console.log(`Call ended by ${socket.id}`, data)
      // TODO: Update call status
      // TODO: Notify both parties
    } catch (error) {
      socket.emit('call:error', { message: 'Failed to end call' })
    }
  })

  // Handle bandwidth change (video to audio fallback)
  socket.on('call:bandwidth-change', (data: { callId: string; type: 'video' | 'audio' }) => {
    console.log(`Bandwidth change in call ${data.callId}`)
    // TODO: Notify other party about type change
    socket.broadcast.emit('call:type-changed', data)
  })
}
