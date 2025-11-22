import { Router } from 'express'
import { CallController } from '../controllers/call.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
const callController = new CallController()

router.use(authenticate)

router.post('/request', callController.requestCall)
router.get('/:callId', callController.getCall)
router.patch('/:callId/status', callController.updateCallStatus)
router.post('/:callId/end', callController.endCall)

export { router as callRouter }
