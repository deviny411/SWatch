import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router = Router()
const authController = new AuthController()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/anonymous', authController.anonymousLogin)
router.post('/logout', authController.logout)

export { router as authRouter }
