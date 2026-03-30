import { Router } from 'express'
import * as ctrl     from '../controllers/notification.controller.js'
import { protect }   from '../middlewares/auth.middleware.js'
 
const router = Router()
 
router.get('/',            protect, ctrl.list)
router.patch('/read-all',  protect, ctrl.markAllRead)  
router.patch('/:id/read',  protect, ctrl.markRead)
 
export default router