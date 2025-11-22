import { query } from '../db'
import { User, UserRole, UserStatus, UserPreferences } from '@shared/types'

export interface CreateUserData {
  role: UserRole
  isAnonymous: boolean
  phoneNumber?: string
}

export interface UpdateUserData {
  status?: UserStatus
  phoneNumber?: string
  lastActive?: Date
}

export interface CreatePreferencesData {
  userId: string
  allowAnonymous?: boolean
  allowRecording?: boolean
  preferredLanguage?: string
  notificationEnabled?: boolean
}

export interface EmergencyContactData {
  userId: string
  name: string
  phoneNumber: string
  relationship?: string
}

export class UserModel {
  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<User> {
    const result = await query(
      `INSERT INTO users (role, is_anonymous, phone_number, status, created_at, last_active)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, role, status, is_anonymous, phone_number, created_at, last_active`,
      [data.role, data.isAnonymous, data.phoneNumber || null, UserStatus.ONLINE]
    )

    const row = result.rows[0]
    return this.mapRowToUser(row)
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToUser(result.rows[0])
  }

  /**
   * Find user by phone number
   */
  async findByPhone(phoneNumber: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToUser(result.rows[0])
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`)
      values.push(data.status)
    }

    if (data.phoneNumber !== undefined) {
      fields.push(`phone_number = $${paramCount++}`)
      values.push(data.phoneNumber)
    }

    if (data.lastActive !== undefined) {
      fields.push(`last_active = $${paramCount++}`)
      values.push(data.lastActive)
    }

    if (fields.length === 0) {
      // No updates, just return current user
      const user = await this.findById(id)
      if (!user) throw new Error('User not found')
      return user
    }

    values.push(id)

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      throw new Error('User not found')
    }

    return this.mapRowToUser(result.rows[0])
  }

  /**
   * Update user status
   */
  async updateStatus(id: string, status: UserStatus): Promise<void> {
    await query(
      'UPDATE users SET status = $1, last_active = NOW() WHERE id = $2',
      [status, id]
    )
  }

  /**
   * Delete user (soft delete by setting status)
   */
  async delete(id: string): Promise<void> {
    await query('DELETE FROM users WHERE id = $1', [id])
  }

  /**
   * Create user preferences
   */
  async createPreferences(data: CreatePreferencesData): Promise<void> {
    await query(
      `INSERT INTO user_preferences (user_id, allow_anonymous, allow_recording, preferred_language, notification_enabled)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         allow_anonymous = EXCLUDED.allow_anonymous,
         allow_recording = EXCLUDED.allow_recording,
         preferred_language = EXCLUDED.preferred_language,
         notification_enabled = EXCLUDED.notification_enabled`,
      [
        data.userId,
        data.allowAnonymous ?? true,
        data.allowRecording ?? false,
        data.preferredLanguage ?? 'en',
        data.notificationEnabled ?? true,
      ]
    )
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const result = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      allowAnonymous: row.allow_anonymous,
      allowRecording: row.allow_recording,
      preferredLanguage: row.preferred_language,
      notificationEnabled: row.notification_enabled,
    }
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(data: EmergencyContactData): Promise<string> {
    const result = await query(
      `INSERT INTO emergency_contacts (user_id, name, phone_number, relationship)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [data.userId, data.name, data.phoneNumber, data.relationship || null]
    )

    return result.rows[0].id
  }

  /**
   * Get user's emergency contacts
   */
  async getEmergencyContacts(userId: string): Promise<any[]> {
    const result = await query(
      'SELECT id, name, phone_number, relationship FROM emergency_contacts WHERE user_id = $1',
      [userId]
    )

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      phoneNumber: row.phone_number,
      relationship: row.relationship,
    }))
  }

  /**
   * Delete emergency contact
   */
  async deleteEmergencyContact(id: string): Promise<void> {
    await query('DELETE FROM emergency_contacts WHERE id = $1', [id])
  }

  /**
   * Map database row to User object
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      role: row.role as UserRole,
      status: row.status as UserStatus,
      isAnonymous: row.is_anonymous,
      createdAt: new Date(row.created_at),
      lastActive: row.last_active ? new Date(row.last_active) : undefined,
    }
  }
}

export const userModel = new UserModel()
