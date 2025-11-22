import { Router } from 'express'
import { EmergencyController } from '../controllers/emergency.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
const emergencyController = new EmergencyController()

router.use(authenticate)

router.post('/trigger', emergencyController.triggerEmergency)
router.get('/:alertId', emergencyController.getAlert)
router.patch('/:alertId/status', emergencyController.updateAlertStatus)

export { router as emergencyRouter }
