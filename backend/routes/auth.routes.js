import { Router }                       from 'express'
import * as ctrl                          from '../controllers/auth.controller.js'
import { protect }                        from '../middlewares/auth.middleware.js'
import validate                           from '../middlewares/validate.middleware.js'
import { loginSchema, registerSchema }    from '../validators/auth.vidator.js'
 
const router = Router()
 
router.post('/register', validate(registerSchema), ctrl.register)
router.post('/login',    validate(loginSchema),    ctrl.login)
router.get('/me',        protect,                  ctrl.me)
 
export default router
 