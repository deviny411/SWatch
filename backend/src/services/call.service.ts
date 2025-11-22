import { callModel } from '../models/call.model'
import { userModel } from '../models/user.model'
import { watcherModel } from '../models/watcher.model'
import { Call, CallStatus, CallType, UserStatus } from '@shared/types'

export interface CreateCallOptions {
  userId: string
  type: CallType
}

export interface AssignWatcherOptions {
  callId: string
  watcherId: string
}

export class CallService {
  /**
   * Request a new call (user side)
   */
  async requestCall(options: CreateCallOptions): Promise<Call> {
    const { userId, type } = options

    // Check if user already has an active call
    const existingCall = await callModel.getActiveCallForUser(userId)
    if (existingCall) {
      throw new Error('You already have an active call')
    }

    // Update user status
    await userModel.updateStatus(userId, UserStatus.IN_CALL)

    // Create new call
    const call = await callModel.create({
      userId,
      type,
    })

    console.log(`📞 Call requested: ${call.id} by user ${userId} (${type})`)

    return call
  }

  /**
   * Assign a watcher to a pending call
   */
  async assignWatcher(options: AssignWatcherOptions): Promise<Call> {
    const { callId, watcherId } = options

    // Get the call
    const call = await callModel.findById(callId)
    if (!call) {
      throw new Error('Call not found')
    }

    if (call.status !== CallStatus.PENDING) {
      throw new Error('Call is not in pending status')
    }

    // Get the watcher
    const watcher = await watcherModel.findById(watcherId)
    if (!watcher) {
      throw new Error('Watcher not found')
    }

    if (!watcher.availability.isAvailable) {
      throw new Error('Watcher is not available')
    }

    // Assign watcher to call
    await callModel.assignWatcher(callId, watcherId)

    // Increment watcher's call count
    await watcherModel.incrementCallCount(watcherId)

    // Update watcher user status
    await userModel.updateStatus(watcher.userId, UserStatus.IN_CALL)

    console.log(`✅ Watcher ${watcherId} assigned to call ${callId}`)

    const updatedCall = await callModel.findById(callId)
    return updatedCall!
  }

  /**
   * Update call status
   */
  async updateCallStatus(callId: string, status: CallStatus): Promise<void> {
    await callModel.updateStatus(callId, status)
    console.log(`📝 Call ${callId} status updated to ${status}`)
  }

  /**
   * End a call
   */
  async endCall(callId: string): Promise<void> {
    const call = await callModel.findById(callId)
    if (!call) {
      throw new Error('Call not found')
    }

    // End the call
    await callModel.endCall(callId)

    // Update user status
    await userModel.updateStatus(call.userId, UserStatus.ONLINE)

    // If watcher was assigned, update their status and counts
    if (call.watcherId) {
      const watcher = await watcherModel.findById(call.watcherId)
      if (watcher) {
        await watcherModel.decrementCallCount(call.watcherId)
        await userModel.updateStatus(watcher.userId, UserStatus.ONLINE)

        // Update watcher stats (calculate call duration)
        if (call.startedAt) {
          const duration = (new Date().getTime() - new Date(call.startedAt).getTime()) / 1000 / 60 / 60 // hours
          await watcherModel.updateStats(call.watcherId, { hours: duration })
        }
      }
    }

    console.log(`🔚 Call ${callId} ended`)
  }

  /**
   * Get call by ID
   */
  async getCall(callId: string): Promise<Call | null> {
    return callModel.findById(callId)
  }

  /**
   * Get active call for user
   */
  async getActiveCallForUser(userId: string): Promise<Call | null> {
    return callModel.getActiveCallForUser(userId)
  }

  /**
   * Get active calls for watcher
   */
  async getActiveCallsForWatcher(watcherId: string): Promise<Call[]> {
    return callModel.getActiveCallsForWatcher(watcherId)
  }

  /**
   * Get call history for user
   */
  async getCallHistory(userId: string, limit = 50): Promise<Call[]> {
    return callModel.getCallHistoryForUser(userId, limit)
  }

  /**
   * Mark call as emergency
   */
  async markAsEmergency(callId: string): Promise<void> {
    await callModel.markAsEmergency(callId)
    console.log(`🚨 Call ${callId} marked as EMERGENCY`)
  }
}

export const callService = new CallService()
