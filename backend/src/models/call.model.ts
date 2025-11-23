import { query } from '../db'
import { Call, CallStatus, CallType } from '@shared/types'

export interface CreateCallData {
  userId: string
  type: CallType
}

export interface UpdateCallData {
  watcherId?: string
  status?: CallStatus
  type?: CallType
  emergencyTriggered?: boolean
  endedAt?: Date
}

export class CallModel {
  /**
   * Create a new call
   */
  async create(data: CreateCallData): Promise<Call> {
    const result = await query(
      `INSERT INTO calls (user_id, status, type, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [data.userId, CallStatus.PENDING, data.type]
    )

    return this.mapRowToCall(result.rows[0])
  }

  /**
   * Find call by ID
   */
  async findById(id: string): Promise<Call | null> {
    const result = await query(
      'SELECT * FROM calls WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToCall(result.rows[0])
  }

  /**
   * Find call by ID with watcher userId
   */
  async findByIdWithWatcherUserId(id: string): Promise<{ call: Call; watcherUserId?: string } | null> {
    const result = await query(
      `SELECT c.*, w.user_id as watcher_user_id
       FROM calls c
       LEFT JOIN watchers w ON c.watcher_id = w.id
       WHERE c.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    const call = this.mapRowToCall(result.rows[0])
    const watcherUserId = result.rows[0].watcher_user_id

    return {
      call,
      watcherUserId: watcherUserId || undefined,
    }
  }

  /**
   * Update call
   */
  async update(id: string, data: UpdateCallData): Promise<Call> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.watcherId !== undefined) {
      fields.push(`watcher_id = $${paramCount++}`)
      values.push(data.watcherId)
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`)
      values.push(data.status)
    }

    if (data.type !== undefined) {
      fields.push(`type = $${paramCount++}`)
      values.push(data.type)
    }

    if (data.emergencyTriggered !== undefined) {
      fields.push(`emergency_triggered = $${paramCount++}`)
      values.push(data.emergencyTriggered)
    }

    if (data.endedAt !== undefined) {
      fields.push(`ended_at = $${paramCount++}`)
      values.push(data.endedAt)
    }

    if (fields.length === 0) {
      const call = await this.findById(id)
      if (!call) throw new Error('Call not found')
      return call
    }

    values.push(id)

    const result = await query(
      `UPDATE calls SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      throw new Error('Call not found')
    }

    return this.mapRowToCall(result.rows[0])
  }

  /**
   * Assign watcher to call
   */
  async assignWatcher(callId: string, watcherId: string): Promise<void> {
    await query(
      'UPDATE calls SET watcher_id = $1, status = $2 WHERE id = $3',
      [watcherId, CallStatus.CONNECTING, callId]
    )
  }

  /**
   * Update call status
   */
  async updateStatus(callId: string, status: CallStatus): Promise<void> {
    await query(
      'UPDATE calls SET status = $1 WHERE id = $2',
      [status, callId]
    )
  }

  /**
   * End call
   */
  async endCall(callId: string): Promise<void> {
    await query(
      'UPDATE calls SET status = $1, ended_at = NOW() WHERE id = $2',
      [CallStatus.ENDED, callId]
    )
  }

  /**
   * Get active call for user
   */
  async getActiveCallForUser(userId: string): Promise<Call | null> {
    const result = await query(
      `SELECT * FROM calls
       WHERE user_id = $1
         AND status IN ($2, $3, $4)
       ORDER BY started_at DESC
       LIMIT 1`,
      [userId, CallStatus.PENDING, CallStatus.CONNECTING, CallStatus.ACTIVE]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToCall(result.rows[0])
  }

  /**
   * Get active calls for watcher
   */
  async getActiveCallsForWatcher(watcherId: string): Promise<Call[]> {
    const result = await query(
      `SELECT * FROM calls
       WHERE watcher_id = $1
         AND status IN ($2, $3)
       ORDER BY started_at DESC`,
      [watcherId, CallStatus.CONNECTING, CallStatus.ACTIVE]
    )

    return result.rows.map(row => this.mapRowToCall(row))
  }

  /**
   * Get pending calls (waiting for watcher)
   */
  async getPendingCalls(limit = 10): Promise<Call[]> {
    const result = await query(
      `SELECT * FROM calls
       WHERE status = $1
       ORDER BY started_at ASC
       LIMIT $2`,
      [CallStatus.PENDING, limit]
    )

    return result.rows.map(row => this.mapRowToCall(row))
  }

  /**
   * Get call history for user
   */
  async getCallHistoryForUser(userId: string, limit = 50): Promise<Call[]> {
    const result = await query(
      `SELECT * FROM calls
       WHERE user_id = $1
       ORDER BY started_at DESC
       LIMIT $2`,
      [userId, limit]
    )

    return result.rows.map(row => this.mapRowToCall(row))
  }

  /**
   * Get call history for watcher
   */
  async getCallHistoryForWatcher(watcherId: string, limit = 50): Promise<Call[]> {
    const result = await query(
      `SELECT * FROM calls
       WHERE watcher_id = $1
       ORDER BY started_at DESC
       LIMIT $2`,
      [watcherId, limit]
    )

    return result.rows.map(row => this.mapRowToCall(row))
  }

  /**
   * Mark call as emergency
   */
  async markAsEmergency(callId: string): Promise<void> {
    await query(
      'UPDATE calls SET emergency_triggered = true, status = $1 WHERE id = $2',
      [CallStatus.EMERGENCY, callId]
    )
  }

  /**
   * Map database row to Call object
   */
  private mapRowToCall(row: any): Call {
    return {
      id: row.id,
      userId: row.user_id,
      watcherId: row.watcher_id,
      status: row.status as CallStatus,
      type: row.type as CallType,
      startedAt: new Date(row.started_at),
      endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
      emergencyTriggered: row.emergency_triggered,
    }
  }
}

export const callModel = new CallModel()
