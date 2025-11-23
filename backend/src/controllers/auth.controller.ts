import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { UserRole } from '@shared/types'
import { AuthRequest } from '../middleware/auth.middleware'

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   * Body: { phoneNumber, password, role? }
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

      // Register user via authService
      const result = await authService.register({
        phoneNumber,
        password,
        role: role as UserRole,
      })

      console.log('✅ User registered successfully:', result.user.id, phoneNumber)

      res.status(201).json(result)
    } catch (error: any) {
      console.error('Registration error:', error)
      res.status(400).json({ error: error.message || 'Registration failed' })
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   * Body: { phoneNumber, password }
   */
  async login(req: Request, res: Response) {
    try {
      const { phoneNumber, password } = req.body

      // Validate input
      if (!phoneNumber || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' })
      }

      // Login user via authService
      const result = await authService.login({
        phoneNumber,
        password,
      })

      console.log('✅ User logged in successfully:', result.user.id, phoneNumber)

      res.status(200).json(result)
    } catch (error: any) {
      console.error('Login error:', error)
      res.status(401).json({ error: error.message || 'Login failed' })
    }
  }

  /**
   * Create anonymous user
   * POST /api/auth/anonymous
   */
  async anonymousLogin(req: Request, res: Response) {
    try {
      // Create anonymous user via authService
      const result = await authService.createAnonymousUser()

      console.log('✅ Anonymous user created successfully:', result.user.id)

      res.status(201).json(result)
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
   */
  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      // Get user from database via authService
      const user = await authService.getUserByToken(req.headers.authorization?.split(' ')[1] || '')

      res.status(200).json({ user })
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
