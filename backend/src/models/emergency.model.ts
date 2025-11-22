import { query } from '../db'
import { EmergencyAlert, EmergencyStatus, EmergencySeverity } from '@shared/types'

export interface CreateEmergencyAlertData {
  callId: string
  userId: string
  watcherId: string
  severity: EmergencySeverity
  latitude: number
  longitude: number
  address?: string
  symptoms?: string[]
}

export interface UpdateEmergencyAlertData {
  status?: EmergencyStatus
  notes?: string
  respondedAt?: Date
  resolvedAt?: Date
}

export class EmergencyModel {
  /**
   * Create emergency alert
   */
  async create(data: CreateEmergencyAlertData): Promise<EmergencyAlert> {
    const result = await query(
      `INSERT INTO emergency_alerts
       (call_id, user_id, watcher_id, status, severity, latitude, longitude, address, symptoms, triggered_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [
        data.callId,
        data.userId,
        data.watcherId,
        EmergencyStatus.TRIGGERED,
        data.severity,
        data.latitude,
        data.longitude,
        data.address || null,
        data.symptoms || null,
      ]
    )

    return this.mapRowToEmergencyAlert(result.rows[0])
  }

  /**
   * Find emergency alert by ID
   */
  async findById(id: string): Promise<EmergencyAlert | null> {
    const result = await query(
      'SELECT * FROM emergency_alerts WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToEmergencyAlert(result.rows[0])
  }

  /**
   * Find emergency alert by call ID
   */
  async findByCallId(callId: string): Promise<EmergencyAlert | null> {
    const result = await query(
      'SELECT * FROM emergency_alerts WHERE call_id = $1 ORDER BY triggered_at DESC LIMIT 1',
      [callId]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToEmergencyAlert(result.rows[0])
  }

  /**
   * Update emergency alert
   */
  async update(id: string, data: UpdateEmergencyAlertData): Promise<EmergencyAlert> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`)
      values.push(data.status)
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`)
      values.push(data.notes)
    }

    if (data.respondedAt !== undefined) {
      fields.push(`responded_at = $${paramCount++}`)
      values.push(data.respondedAt)
    }

    if (data.resolvedAt !== undefined) {
      fields.push(`resolved_at = $${paramCount++}`)
      values.push(data.resolvedAt)
    }

    if (fields.length === 0) {
      const alert = await this.findById(id)
      if (!alert) throw new Error('Emergency alert not found')
      return alert
    }

    values.push(id)

    const result = await query(
      `UPDATE emergency_alerts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      throw new Error('Emergency alert not found')
    }

    return this.mapRowToEmergencyAlert(result.rows[0])
  }

  /**
   * Update alert status
   */
  async updateStatus(id: string, status: EmergencyStatus): Promise<void> {
    const updates: any = { status }

    if (status === EmergencyStatus.RESPONDED) {
      updates.respondedAt = new Date()
    } else if (status === EmergencyStatus.RESOLVED || status === EmergencyStatus.CANCELLED) {
      updates.resolvedAt = new Date()
    }

    await this.update(id, updates)
  }

  /**
   * Get active emergency alerts
   */
  async getActive(): Promise<EmergencyAlert[]> {
    const result = await query(
      `SELECT * FROM emergency_alerts
       WHERE status IN ($1, $2)
       ORDER BY triggered_at DESC`,
      [EmergencyStatus.TRIGGERED, EmergencyStatus.DISPATCHED]
    )

    return result.rows.map(row => this.mapRowToEmergencyAlert(row))
  }

  /**
   * Get emergency alert history
   */
  async getHistory(limit = 100): Promise<EmergencyAlert[]> {
    const result = await query(
      `SELECT * FROM emergency_alerts
       ORDER BY triggered_at DESC
       LIMIT $1`,
      [limit]
    )

    return result.rows.map(row => this.mapRowToEmergencyAlert(row))
  }

  /**
   * Get alerts by user
   */
  async getByUser(userId: string, limit = 50): Promise<EmergencyAlert[]> {
    const result = await query(
      `SELECT * FROM emergency_alerts
       WHERE user_id = $1
       ORDER BY triggered_at DESC
       LIMIT $2`,
      [userId, limit]
    )

    return result.rows.map(row => this.mapRowToEmergencyAlert(row))
  }

  /**
   * Get alerts by watcher
   */
  async getByWatcher(watcherId: string, limit = 50): Promise<EmergencyAlert[]> {
    const result = await query(
      `SELECT * FROM emergency_alerts
       WHERE watcher_id = $1
       ORDER BY triggered_at DESC
       LIMIT $2`,
      [watcherId, limit]
    )

    return result.rows.map(row => this.mapRowToEmergencyAlert(row))
  }

  /**
   * Map database row to EmergencyAlert object
   */
  private mapRowToEmergencyAlert(row: any): EmergencyAlert {
    return {
      id: row.id,
      callId: row.call_id,
      userId: row.user_id,
      watcherId: row.watcher_id,
      status: row.status as EmergencyStatus,
      severity: row.severity as EmergencySeverity,
      location: {
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        address: row.address,
      },
      symptoms: row.symptoms,
      triggeredAt: new Date(row.triggered_at),
      respondedAt: row.responded_at ? new Date(row.responded_at) : undefined,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
      notes: row.notes,
    }
  }
}

export const emergencyModel = new EmergencyModel()
