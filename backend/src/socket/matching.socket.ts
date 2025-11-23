import { Server, Socket } from 'socket.io'
import { callService } from '../services/call.service'
import { CallType } from '@shared/types'

interface WaitingUser {
  userId: string
  socketId: string
  joinedAt: string
  status: 'waiting' | 'in_call'
}

// In-memory queue of users seeking help
const waitingQueue: Map<string, WaitingUser> = new Map()

export const handleMatchingEvents = (io: Server, socket: Socket) => {
  // User seeking help joins the queue
  socket.on('seek-help:join', (data: { userId: string }) => {
    console.log(`📞 User ${data.userId} seeking help`)

    const waitingUser: WaitingUser = {
      userId: data.userId,
      socketId: socket.id,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
    }

    waitingQueue.set(data.userId, waitingUser)

    // Notify all watchers about the updated queue
    broadcastQueueUpdate(io)

    // Confirm to the user
    socket.emit('seek-help:joined', { success: true })
  })

  // User leaves the queue
  socket.on('seek-help:leave', (data: { userId: string }) => {
    console.log(`📞 User ${data.userId} left queue`)
    waitingQueue.delete(data.userId)
    broadcastQueueUpdate(io)
  })

  // Watcher requests the current queue
  socket.on('watcher:get-queue', () => {
    const queue = Array.from(waitingQueue.values())
    socket.emit('watcher:queue-update', { queue })
  })

  // Watcher accepts a user
  socket.on('watcher:accept-user', async (data: { userId: string; watcherId: string }) => {
    console.log(`✅ Watcher ${data.watcherId} accepting user ${data.userId}`)

    const waitingUser = waitingQueue.get(data.userId)
    if (!waitingUser) {
      socket.emit('error', { message: 'User not found in queue' })
      return
    }

    try {
      // Create a call with the user seeking help as the userId and watcher's user ID
      const call = await callService.requestCallWithWatcher({
        userId: data.userId,
        watcherUserId: data.watcherId,
        type: CallType.VIDEO,
      })

      console.log(`📞 Created call ${call.id} for match between user ${data.userId} and watcher ${data.watcherId}`)

      // Mark user as in call
      waitingUser.status = 'in_call'
      waitingQueue.set(data.userId, waitingUser)

      // Notify the waiting user that they've been matched
      io.to(waitingUser.socketId).emit('seek-help:matched', {
        callId: call.id,
        remoteUserId: data.watcherId, // Pass the watcher's user ID
      })

      console.log(`📤 Notified user ${data.userId} of match`)

      // Notify the watcher that the match was successful
      socket.emit('watcher:match-success', {
        callId: call.id,
        remoteUserId: data.userId, // Pass the user's ID
      })

      console.log(`📤 Notified watcher ${data.watcherId} of match success`)

      // Remove from queue after a delay (they're now in a call)
      setTimeout(() => {
        waitingQueue.delete(data.userId)
        broadcastQueueUpdate(io)
      }, 2000)

      // Update the queue for all watchers
      broadcastQueueUpdate(io)
    } catch (error) {
      console.error('❌ Failed to create call for match:', error)
      socket.emit('error', { message: 'Failed to create call' })
    }
  })

  // Handle disconnection - remove from queue if waiting
  socket.on('disconnect', () => {
    // Find if this socket was in the queue
    for (const [userId, user] of waitingQueue.entries()) {
      if (user.socketId === socket.id) {
        console.log(`📞 User ${userId} disconnected while waiting`)
        waitingQueue.delete(userId)
        broadcastQueueUpdate(io)
        break
      }
    }
  })
}

// Helper function to broadcast queue updates to all watchers
function broadcastQueueUpdate(io: Server) {
  const queue = Array.from(waitingQueue.values())
  io.emit('watcher:queue-update', { queue })
  console.log(`📋 Queue updated: ${queue.length} users waiting`)
}
