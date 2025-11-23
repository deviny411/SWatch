import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { UserRole } from '@shared/types'
import { AuthRequest } from '../middleware/auth.middleware'

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   * Body: { phoneNumber, password, role? }
   *
   * TEMPORARY: Bypassing database to test other features
   */
  async register(req: Request, res: Response) {
    try {
      const { phoneNumber, password, role } = req.body

      // Validate input
      if (!phoneNumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' })
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' })
      }

      // TEMPORARY WORKAROUND: Create mock user without database
      const jwt = require('jsonwebtoken')

      const mockUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: role || 'USER',
        status: 'ONLINE',
        isAnonymous: false,
        createdAt: new Date(),
      }

      const token = jwt.sign(
        { userId: mockUser.id, role: mockUser.role },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      )

      console.log('✅ Created temporary user (database bypass):', mockUser.id, phoneNumber)

      res.status(201).json({
        user: mockUser,
        token: token,
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      res.status(400).json({ error: error.message || 'Registration failed' })
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   * Body: { phoneNumber, password }
   *
   * TEMPORARY: Bypassing database to test other features
   */
  async login(req: Request, res: Response) {
    try {
      const { phoneNumber, password } = req.body

      // Validate input
      if (!phoneNumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' })
      }

      // TEMPORARY WORKAROUND: Create mock user without database
      const jwt = require('jsonwebtoken')

      const mockUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'USER',
        status: 'ONLINE',
        isAnonymous: false,
        createdAt: new Date(),
      }

      const token = jwt.sign(
        { userId: mockUser.id, role: mockUser.role },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      )

      console.log('✅ Logged in temporary user (database bypass):', mockUser.id, phoneNumber)

      res.status(200).json({
        user: mockUser,
        token: token,
      })
    } catch (error: any) {
      console.error('Login error:', error)
      res.status(401).json({ error: error.message || 'Login failed' })
    }
  }

  /**
   * Create anonymous user
   * POST /api/auth/anonymous
   *
   * TEMPORARY: Bypassing database to test other features
   */
  async anonymousLogin(req: Request, res: Response) {
    try {
      // TEMPORARY WORKAROUND: Create mock anonymous user without database
      // This bypasses the database password issue so you can test other features
      const jwt = require('jsonwebtoken')
      const { v4: uuidv4 } = require('crypto')

      const mockUser = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'USER',
        status: 'ONLINE',
        isAnonymous: true,
        createdAt: new Date(),
      }

      const token = jwt.sign(
        { userId: mockUser.id, role: mockUser.role },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      )

      console.log('✅ Created temporary anonymous user (database bypass):', mockUser.id)

      res.status(201).json({
        user: mockUser,
        token: token,
      })
    } catch (error: any) {
      console.error('Anonymous login error:', error)
      res.status(500).json({ error: error.message || 'Anonymous login failed' })
    }
  }

  /**
   * Logout user (client-side token removal mainly)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response) {
    try {
      // For now, logout is handled client-side by removing the token
      // In the future, we could add token blacklisting with Redis
      res.status(200).json({ message: 'Logged out successfully' })
    } catch (error: any) {
      res.status(500).json({ error: 'Logout failed' })
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   *
   * TEMPORARY: Bypassing database to test other features
   */
  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      // TEMPORARY WORKAROUND: Return mock user from JWT token data
      const mockUser = {
        id: req.user.id,
        role: req.user.role,
        status: 'ONLINE',
        isAnonymous: req.user.id.includes('temp-'),
        createdAt: new Date(),
      }

      res.status(200).json({ user: mockUser })
    } catch (error: any) {
      console.error('Get user error:', error)
      res.status(500).json({ error: 'Failed to get user' })
    }
  }

  /**
   * Change password
   * POST /api/auth/change-password
   * Body: { oldPassword, newPassword }
   */
  async changePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const { oldPassword, newPassword } = req.body

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new password are required' })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' })
      }

      await authService.changePassword(req.user.id, oldPassword, newPassword)

      res.status(200).json({ message: 'Password changed successfully' })
    } catch (error: any) {
      console.error('Change password error:', error)
      res.status(400).json({ error: error.message || 'Failed to change password' })
    }
  }
}
