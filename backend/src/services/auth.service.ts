import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'
import { userModel } from '../models/user.model'
import { User, UserRole } from '@shared/types'

const SALT_ROUNDS = 10
const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

export interface RegisterData {
  phoneNumber: string
  password: string
  role?: UserRole
}

export interface LoginData {
  phoneNumber: string
  password: string
}

export interface TokenPayload {
  userId: string
  role: UserRole
}

export interface AuthResult {
  user: User
  token: string
}

// Temporary in-memory password storage (will be moved to database in production)
// For MVP, we'll keep this simple - in production, add a passwords table
const passwordStore = new Map<string, string>()

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await userModel.findByPhone(data.phoneNumber)
    if (existingUser) {
      throw new Error('User with this phone number already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

    // Create user
    const user = await userModel.create({
      role: data.role || UserRole.USER,
      isAnonymous: false,
      phoneNumber: data.phoneNumber,
    })

    // Create default preferences
    await userModel.createPreferences({
      userId: user.id,
      allowAnonymous: true,
      allowRecording: false,
      preferredLanguage: 'en',
      notificationEnabled: true,
    })

    // Store password (temporary solution for MVP)
    passwordStore.set(user.id, hashedPassword)

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      role: user.role,
    })

    return { user, token }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResult> {
    // Find user by phone
    const user = await userModel.findByPhone(data.phoneNumber)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Check password
    const storedHash = passwordStore.get(user.id)
    if (!storedHash) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(data.password, storedHash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Update last active
    await userModel.update(user.id, {
      lastActive: new Date(),
    })

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      role: user.role,
    })

    return { user, token }
  }

  /**
   * Create anonymous user
   */
  async createAnonymousUser(): Promise<AuthResult> {
    // Create anonymous user
    const user = await userModel.create({
      role: UserRole.USER,
      isAnonymous: true,
    })

    // Create default preferences
    await userModel.createPreferences({
      userId: user.id,
      allowAnonymous: true,
      allowRecording: false,
      preferredLanguage: 'en',
      notificationEnabled: false, // Anonymous users don't get notifications
    })

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      role: user.role,
    })

    return { user, token }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
      return decoded
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: TokenPayload): string {
    // Using hardcoded value due to TypeScript strict type checking
    // Can be made configurable in production with proper type handling
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
    })
  }

  /**
   * Get user by token
   */
  async getUserByToken(token: string): Promise<User> {
    const payload = this.verifyToken(token)
    const user = await userModel.findById(payload.userId)

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await userModel.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.isAnonymous) {
      throw new Error('Anonymous users cannot change password')
    }

    // Verify old password
    const storedHash = passwordStore.get(userId)
    if (!storedHash) {
      throw new Error('Password not set')
    }

    const isValid = await bcrypt.compare(oldPassword, storedHash)
    if (!isValid) {
      throw new Error('Invalid old password')
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
    passwordStore.set(userId, hashedPassword)
  }

  /**
   * Set password for anonymous user (convert to registered)
   */
  async setPasswordForAnonymous(userId: string, phoneNumber: string, password: string): Promise<void> {
    const user = await userModel.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (!user.isAnonymous) {
      throw new Error('User is already registered')
    }

    // Check if phone number is already taken
    const existing = await userModel.findByPhone(phoneNumber)
    if (existing) {
      throw new Error('Phone number already in use')
    }

    // Update user
    await userModel.update(userId, {
      phoneNumber,
    })

    // Hash and store password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    passwordStore.set(userId, hashedPassword)
  }
}

export const authService = new AuthService()
