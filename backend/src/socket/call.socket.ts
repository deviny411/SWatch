import { Server, Socket } from 'socket.io'
import { WebRTCSignal, CallStatus, CallType } from '@shared/types'
import { callService } from '../services/call.service'
import { callMatchingService } from '../services/call-matching.service'

// Store socket to user/watcher mapping
const socketUserMap = new Map<string, string>() // socketId -> userId
const userSocketMap = new Map<string, string>() // userId -> socketId

export const handleCallEvents = (io: Server, socket: Socket) => {
  /**
   * User joins as themselves (store their socket mapping)
   */
  socket.on('user:join', (data: { userId: string }) => {
    console.log(`User ${data.userId} joined with socket ${socket.id}`)
    socketUserMap.set(socket.id, data.userId)
    userSocketMap.set(data.userId, socket.id)
  })

  /**
   * Handle call request from user
   */
  socket.on('call:request', async (data: { userId: string; type: CallType }) => {
    try {
      console.log(`📞 Call request from ${data.userId}:`, data)

      // Create the call via service
      const call = await callService.requestCall({
        userId: data.userId,
        type: data.type,
      })

      // Find an available watcher
      const watcher = await callMatchingService.findAvailableWatcher()

      if (!watcher) {
        // No watchers available
        socket.emit('call:no-watchers', { callId: call.id })
        console.log('⚠️ No available watchers')
        return
      }

      // Assign watcher to call
      await callService.assignWatcher({
        callId: call.id,
        watcherId: watcher.id,
      })

      // Notify the watcher about incoming call
      const watcherSocketId = userSocketMap.get(watcher.userId)
      if (watcherSocketId) {
        io.to(watcherSocketId).emit('call:incoming', {
          callId: call.id,
          userId: data.userId,
          type: data.type,
        })
        console.log(`📞 Notified watcher ${watcher.id} about call ${call.id}`)
      }

      // Notify user that watcher was found
      socket.emit('call:watcher-assigned', {
        callId: call.id,
        watcherId: watcher.id,
      })
    } catch (error: any) {
      console.error('Call request error:', error)
      socket.emit('call:error', { message: error.message || 'Failed to request call' })
    }
  })

  /**
   * Watcher accepts the call
   */
  socket.on('call:accept', async (data: { callId: string; watcherId: string }) => {
    try {
      console.log(`✅ Watcher ${data.watcherId} accepted call ${data.callId}`)

      // Update call status to CONNECTING
      await callService.updateCallStatus(data.callId, CallStatus.CONNECTING)

      // Get the call to find the user
      const call = await callService.getCall(data.callId)
      if (!call) {
        throw new Error('Call not found')
      }

      // Notify the user that watcher accepted
      const userSocketId = userSocketMap.get(call.userId)
      if (userSocketId) {
        io.to(userSocketId).emit('call:accepted', {
          callId: data.callId,
          watcherId: data.watcherId,
        })
      }
    } catch (error: any) {
      console.error('Call accept error:', error)
      socket.emit('call:error', { message: error.message || 'Failed to accept call' })
    }
  })

  /**
   * Handle WebRTC signaling (offer/answer/ICE candidates)
   */
  socket.on('call:signal', (signal: WebRTCSignal) => {
    console.log(`🔄 WebRTC signal: ${signal.type} from ${signal.from} to ${signal.to}`)

    // Forward signal to the target peer
    const targetSocketId = userSocketMap.get(signal.to)
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:signal', signal)
    } else {
      console.error(`Target user ${signal.to} not connected`)
    }
  })

  /**
   * Call is active (both peers connected)
   */
  socket.on('call:active', async (data: { callId: string }) => {
    try {
      await callService.updateCallStatus(data.callId, CallStatus.ACTIVE)
      console.log(`🎥 Call ${data.callId} is now ACTIVE`)

      // Notify both parties
      const call = await callService.getCall(data.callId)
      if (call) {
        const userSocketId = userSocketMap.get(call.userId)
        const watcherSocketId = call.watcherId ? userSocketMap.get(call.watcherId) : null

        if (userSocketId) {
          io.to(userSocketId).emit('call:status', { callId: data.callId, status: CallStatus.ACTIVE })
        }
        if (watcherSocketId) {
          io.to(watcherSocketId).emit('call:status', { callId: data.callId, status: CallStatus.ACTIVE })
        }
      }
    } catch (error: any) {
      console.error('Call active error:', error)
    }
  })

  /**
   * Handle call end
   */
  socket.on('call:end', async (data: { callId: string }) => {
    try {
      console.log(`🔚 Call ${data.callId} ended`)

      const call = await callService.getCall(data.callId)
      if (!call) {
        return
      }

      // End the call
      await callService.endCall(data.callId)

      // Notify both parties
      const userSocketId = userSocketMap.get(call.userId)
      const watcherSocketId = call.watcherId ? userSocketMap.get(call.watcherId) : null

      if (userSocketId) {
        io.to(userSocketId).emit('call:ended', { callId: data.callId })
      }
      if (watcherSocketId) {
        io.to(watcherSocketId).emit('call:ended', { callId: data.callId })
      }
    } catch (error: any) {
      console.error('Call end error:', error)
      socket.emit('call:error', { message: error.message || 'Failed to end call' })
    }
  })

  /**
   * Handle bandwidth change (video to audio fallback)
   */
  socket.on('call:bandwidth-change', async (data: { callId: string; type: CallType }) => {
    try {
      console.log(`📶 Bandwidth change in call ${data.callId} to ${data.type}`)

      const call = await callService.getCall(data.callId)
      if (!call) {
        return
      }

      // Notify the other party
      const userId = socketUserMap.get(socket.id)
      const otherUserId = userId === call.userId ? call.watcherId : call.userId

      if (otherUserId) {
        const otherSocketId = userSocketMap.get(otherUserId)
        if (otherSocketId) {
          io.to(otherSocketId).emit('call:type-changed', {
            callId: data.callId,
            type: data.type,
          })
        }
      }
    } catch (error: any) {
      console.error('Bandwidth change error:', error)
    }
  })

  /**
   * Handle disconnect
   */
  socket.on('disconnect', async () => {
    const userId = socketUserMap.get(socket.id)
    if (userId) {
      console.log(`User ${userId} disconnected`)
      socketUserMap.delete(socket.id)
      userSocketMap.delete(userId)

      // Check if they had an active call and end it
      try {
        const activeCall = await callService.getActiveCallForUser(userId)
        if (activeCall) {
          await callService.endCall(activeCall.id)

          // Notify the other party
          const otherUserId = userId === activeCall.userId ? activeCall.watcherId : activeCall.userId
          if (otherUserId) {
            const otherSocketId = userSocketMap.get(otherUserId)
            if (otherSocketId) {
              io.to(otherSocketId).emit('call:ended', {
                callId: activeCall.id,
                reason: 'disconnect',
              })
            }
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error)
      }
    }
  })
}
