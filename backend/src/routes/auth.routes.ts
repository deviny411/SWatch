import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
const authController = new AuthController()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/anonymous', authController.anonymousLogin)

// Protected routes (require authentication)
router.get('/me', authenticate, authController.me)
router.post('/logout', authenticate, authController.logout)
router.post('/change-password', authenticate, authController.changePassword)

export { router as authRouter }
