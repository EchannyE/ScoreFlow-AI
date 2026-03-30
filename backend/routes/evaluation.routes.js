import { Router }                from 'express'
import * as ctrl                   from '../controllers/evaluation.controller.js'
import { protect, requireRole }    from '../middlewares/auth.middleware.js'
 
const router = Router()
 
router.get('/my-queue', protect, requireRole('evaluator'),            ctrl.myQueue)
router.get('/',         protect,                                       ctrl.list)
router.post('/',        protect, requireRole('evaluator'),            ctrl.create)
 
export default router