import { query } from '../db'
import {
  Watcher,
  WatcherStatus,
  Shift,
  ShiftStatus,
  TrainingModule,
  WatcherTrainingProgress,
} from '@shared/types'

export interface CreateWatcherData {
  userId: string
  timezone?: string
}

export interface UpdateWatcherData {
  status?: WatcherStatus
  trainingCompleted?: boolean
  backgroundCheckCompleted?: boolean
  isAvailable?: boolean
  maxConcurrentCalls?: number
  timezone?: string
}

export interface CreateShiftData {
  watcherId: string
  startTime: Date
  endTime: Date
}

export class WatcherModel {
  /**
   * Create a new watcher application
   */
  async create(data: CreateWatcherData): Promise<Watcher> {
    const result = await query(
      `INSERT INTO watchers (user_id, status, timezone, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [data.userId, WatcherStatus.PENDING_APPROVAL, data.timezone || 'UTC']
    )

    return this.mapRowToWatcher(result.rows[0])
  }

  /**
   * Find watcher by ID
   */
  async findById(id: string): Promise<Watcher | null> {
    const result = await query(
      'SELECT * FROM watchers WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToWatcher(result.rows[0])
  }

  /**
   * Find watcher by user ID
   */
  async findByUserId(userId: string): Promise<Watcher | null> {
    const result = await query(
      'SELECT * FROM watchers WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToWatcher(result.rows[0])
  }

  /**
   * Update watcher
   */
  async update(id: string, data: UpdateWatcherData): Promise<Watcher> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`)
      values.push(data.status)
    }

    if (data.trainingCompleted !== undefined) {
      fields.push(`training_completed = $${paramCount++}`)
      values.push(data.trainingCompleted)
    }

    if (data.backgroundCheckCompleted !== undefined) {
      fields.push(`background_check_completed = $${paramCount++}`)
      values.push(data.backgroundCheckCompleted)
    }

    if (data.isAvailable !== undefined) {
      fields.push(`is_available = $${paramCount++}`)
      values.push(data.isAvailable)
    }

    if (data.maxConcurrentCalls !== undefined) {
      fields.push(`max_concurrent_calls = $${paramCount++}`)
      values.push(data.maxConcurrentCalls)
    }

    if (data.timezone !== undefined) {
      fields.push(`timezone = $${paramCount++}`)
      values.push(data.timezone)
    }

    if (fields.length === 0) {
      const watcher = await this.findById(id)
      if (!watcher) throw new Error('Watcher not found')
      return watcher
    }

    values.push(id)

    const result = await query(
      `UPDATE watchers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      throw new Error('Watcher not found')
    }

    return this.mapRowToWatcher(result.rows[0])
  }

  /**
   * Find available watchers
   */
  async findAvailable(): Promise<Watcher[]> {
    const result = await query(
      `SELECT * FROM watchers
       WHERE status = $1
         AND is_available = true
         AND current_call_count < max_concurrent_calls
       ORDER BY current_call_count ASC, total_calls ASC
       LIMIT 10`,
      [WatcherStatus.APPROVED]
    )

    return result.rows.map(row => this.mapRowToWatcher(row))
  }

  /**
   * Increment current call count
   */
  async incrementCallCount(id: string): Promise<void> {
    await query(
      `UPDATE watchers
       SET current_call_count = current_call_count + 1,
           total_calls = total_calls + 1
       WHERE id = $1`,
      [id]
    )
  }

  /**
   * Decrement current call count
   */
  async decrementCallCount(id: string): Promise<void> {
    await query(
      `UPDATE watchers
       SET current_call_count = GREATEST(0, current_call_count - 1)
       WHERE id = $1`,
      [id]
    )
  }

  /**
   * Update watcher stats
   */
  async updateStats(id: string, data: { hours?: number; emergenciesHandled?: number }): Promise<void> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.hours !== undefined) {
      fields.push(`total_hours = total_hours + $${paramCount++}`)
      values.push(data.hours)
    }

    if (data.emergenciesHandled !== undefined) {
      fields.push(`emergencies_handled = emergencies_handled + $${paramCount++}`)
      values.push(data.emergenciesHandled)
    }

    if (fields.length === 0) return

    values.push(id)

    await query(
      `UPDATE watchers SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      values
    )
  }

  /**
   * Create a shift
   */
  async createShift(data: CreateShiftData): Promise<Shift> {
    const result = await query(
      `INSERT INTO shifts (watcher_id, status, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.watcherId, ShiftStatus.SCHEDULED, data.startTime, data.endTime]
    )

    return this.mapRowToShift(result.rows[0])
  }

  /**
   * Get watcher shifts
   */
  async getShifts(watcherId: string, limit = 50): Promise<Shift[]> {
    const result = await query(
      `SELECT * FROM shifts
       WHERE watcher_id = $1
       ORDER BY start_time DESC
       LIMIT $2`,
      [watcherId, limit]
    )

    return result.rows.map(row => this.mapRowToShift(row))
  }

  /**
   * Update shift status
   */
  async updateShiftStatus(
    shiftId: string,
    status: ShiftStatus,
    actualTime?: Date
  ): Promise<void> {
    if (status === ShiftStatus.ACTIVE && actualTime) {
      await query(
        'UPDATE shifts SET status = $1, actual_start_time = $2 WHERE id = $3',
        [status, actualTime, shiftId]
      )
    } else if (status === ShiftStatus.COMPLETED && actualTime) {
      await query(
        'UPDATE shifts SET status = $1, actual_end_time = $2 WHERE id = $3',
        [status, actualTime, shiftId]
      )
    } else {
      await query(
        'UPDATE shifts SET status = $1 WHERE id = $2',
        [status, shiftId]
      )
    }
  }

  /**
   * Record training progress
   */
  async recordTrainingProgress(
    watcherId: string,
    moduleId: string,
    completed: boolean,
    score?: number
  ): Promise<void> {
    await query(
      `INSERT INTO watcher_training_progress (watcher_id, module_id, completed, completed_at, score)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (watcher_id, module_id) DO UPDATE SET
         completed = EXCLUDED.completed,
         completed_at = EXCLUDED.completed_at,
         score = EXCLUDED.score`,
      [watcherId, moduleId, completed, completed ? new Date() : null, score || null]
    )
  }

  /**
   * Get training progress
   */
  async getTrainingProgress(watcherId: string): Promise<WatcherTrainingProgress[]> {
    const result = await query(
      `SELECT * FROM watcher_training_progress WHERE watcher_id = $1`,
      [watcherId]
    )

    return result.rows.map(row => ({
      watcherId: row.watcher_id,
      moduleId: row.module_id,
      completed: row.completed,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      score: row.score,
    }))
  }

  /**
   * Map database row to Watcher object
   */
  private mapRowToWatcher(row: any): Watcher {
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status as WatcherStatus,
      certifications: [], // TODO: Load certifications if needed
      trainingCompleted: row.training_completed,
      backgroundCheckCompleted: row.background_check_completed,
      availability: {
        isAvailable: row.is_available,
        maxConcurrentCalls: row.max_concurrent_calls,
        currentCallCount: row.current_call_count,
        timezone: row.timezone,
      },
      stats: {
        totalCalls: row.total_calls,
        totalHours: parseFloat(row.total_hours),
        emergenciesHandled: row.emergencies_handled,
        lastActiveAt: row.last_active_at ? new Date(row.last_active_at) : undefined,
      },
    }
  }

  /**
   * Map database row to Shift object
   */
  private mapRowToShift(row: any): Shift {
    return {
      id: row.id,
      watcherId: row.watcher_id,
      status: row.status as ShiftStatus,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      actualStartTime: row.actual_start_time ? new Date(row.actual_start_time) : undefined,
      actualEndTime: row.actual_end_time ? new Date(row.actual_end_time) : undefined,
      callsHandled: row.calls_handled,
    }
  }
}

export const watcherModel = new WatcherModel()
