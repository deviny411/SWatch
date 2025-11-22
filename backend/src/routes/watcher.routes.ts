import { Router } from 'express'
import { WatcherController } from '../controllers/watcher.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { UserRole } from '@shared/types'

const router = Router()
const watcherController = new WatcherController()

router.use(authenticate)

router.post('/apply', watcherController.applyAsWatcher)
router.get('/profile', authorize(UserRole.WATCHER), watcherController.getProfile)
router.patch('/availability', authorize(UserRole.WATCHER), watcherController.updateAvailability)
router.get('/shifts', authorize(UserRole.WATCHER), watcherController.getShifts)
router.post('/shifts', authorize(UserRole.WATCHER), watcherController.createShift)

export { router as watcherRouter }
