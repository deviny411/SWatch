import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { callService } from '../services/call.service'
import { callMatchingService } from '../services/call-matching.service'
import { CallType, CallStatus } from '@shared/types'

export class CallController {
  /**
   * Request a new call
   * POST /api/calls/request
   * Body: { type: 'VIDEO' | 'AUDIO_ONLY' }
   */
  async requestCall(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const { type } = req.body

      if (!type || ![CallType.VIDEO, CallType.AUDIO_ONLY].includes(type)) {
        return res.status(400).json({ error: 'Invalid call type' })
      }

      // Create the call
      const call = await callService.requestCall({
        userId: req.user.id,
        type,
      })

      res.status(201).json({ call })
    } catch (error: any) {
      console.error('Request call error:', error)
      res.status(400).json({ error: error.message || 'Call request failed' })
    }
  }

  /**
   * Get call by ID
   * GET /api/calls/:callId
   */
  async getCall(req: AuthRequest, res: Response) {
    try {
      const { callId } = req.params

      const result = await callService.getCallWithDetails(callId)

      if (!result) {
        return res.status(404).json({ error: 'Call not found' })
      }

      res.status(200).json(result)
    } catch (error: any) {
      console.error('Get call error:', error)
      res.status(500).json({ error: 'Failed to get call' })
    }
  }

  /**
   * Update call status
   * PATCH /api/calls/:callId/status
   * Body: { status: CallStatus }
   */
  async updateCallStatus(req: AuthRequest, res: Response) {
    try {
      const { callId } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({ error: 'Status is required' })
      }

      await callService.updateCallStatus(callId, status)

      res.status(200).json({ message: 'Call status updated' })
    } catch (error: any) {
      console.error('Update call status error:', error)
      res.status(400).json({ error: error.message || 'Failed to update call status' })
    }
  }

  /**
   * End a call
   * POST /api/calls/:callId/end
   */
  async endCall(req: AuthRequest, res: Response) {
    try {
      const { callId } = req.params

      await callService.endCall(callId)

      res.status(200).json({ message: 'Call ended successfully' })
    } catch (error: any) {
      console.error('End call error:', error)
      res.status(400).json({ error: error.message || 'Failed to end call' })
    }
  }

  /**
   * Trigger emergency for a call
   * POST /api/calls/:callId/emergency
   */
  async triggerEmergency(req: AuthRequest, res: Response) {
    try {
      const { callId } = req.params

      await callService.markAsEmergency(callId)

      console.log(`🚨 Emergency triggered for call ${callId} by ${req.user?.id}`)

      res.status(200).json({
        message: 'Emergency services notified',
        emergency: true
      })
    } catch (error: any) {
      console.error('Trigger emergency error:', error)
      res.status(400).json({ error: error.message || 'Failed to trigger emergency' })
    }
  }

  /**
   * Get active call for current user
   * GET /api/calls/active
   */
  async getActiveCall(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const call = await callService.getActiveCallForUser(req.user.id)

      if (!call) {
        return res.status(404).json({ error: 'No active call' })
      }

      res.status(200).json({ call })
    } catch (error: any) {
      console.error('Get active call error:', error)
      res.status(500).json({ error: 'Failed to get active call' })
    }
  }

  /**
   * Get call history
   * GET /api/calls/history
   */
  async getHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const limit = parseInt(req.query.limit as string) || 50

      const calls = await callService.getCallHistory(req.user.id, limit)

      res.status(200).json({ calls })
    } catch (error: any) {
      console.error('Get call history error:', error)
      res.status(500).json({ error: 'Failed to get call history' })
    }
  }

  /**
   * Get available watcher count
   * GET /api/calls/available-watchers
   */
  async getAvailableWatchers(req: AuthRequest, res: Response) {
    try {
      const count = await callMatchingService.getAvailableWatcherCount()

      res.status(200).json({ count, available: count > 0 })
    } catch (error: any) {
      console.error('Get available watchers error:', error)
      res.status(500).json({ error: 'Failed to get available watchers' })
    }
  }
}
