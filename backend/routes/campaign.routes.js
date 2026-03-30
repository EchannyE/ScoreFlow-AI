import { Router }               from 'express'
import * as ctrl                  from '../controllers/campaign.controller.js'
import { protect, requireRole }   from '../middlewares/auth.middleware.js'
 
const router = Router()
 
router.get('/',           protect,                      ctrl.list)
router.get('/:id',        protect,                      ctrl.get)
router.get('/:id/stats',  protect,                      ctrl.stats)
router.post('/',          protect, requireRole('admin'), ctrl.create)
router.patch('/:id',      protect, requireRole('admin'), ctrl.update)
router.delete('/:id',     protect, requireRole('admin'), ctrl.remove)
 
export default router