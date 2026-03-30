import { Router }               from 'express'
import * as ctrl                  from '../controllers/submission.controller.js'
import { protect, requireRole }   from '../middlewares/auth.middleware.js'
import validate                   from '../middlewares/validate.middleware.js'
import { submissionSchema }       from '../validators/submission.validator.js'
 
const router = Router()
 
router.get('/mine',   protect,  ctrl.mine)   
router.get('/',       protect,  ctrl.list)
router.get('/:id',    protect,  ctrl.get)
router.post('/',      protect, validate(submissionSchema), ctrl.create)
router.patch('/:id/assign', protect, requireRole('admin'), ctrl.assign)
router.patch('/:id',  protect,  ctrl.update)
 
export default router