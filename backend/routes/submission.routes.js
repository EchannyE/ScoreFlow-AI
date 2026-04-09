import { Router } from 'express'
import * as ctrl from '../controllers/submission.controller.js'
import { protect, requireRole } from '../middlewares/auth.middleware.js'
import validate from '../middlewares/validate.middleware.js'
import { submissionSchema } from '../validators/submission.validator.js'

const router = Router()

// ================================
// 📌 USER ROUTES
// ================================
router.get('/mine', protect, ctrl.mine)

router.post(
  '/',
  protect,
  validate(submissionSchema),
  ctrl.create
)

// ================================
// 📌 ADMIN / MANAGEMENT ROUTES
// ================================
router.patch(
  '/:id/assign',
  protect,
  requireRole('admin'),
  ctrl.assign
)

router.patch(
  '/:id',
  protect,
  requireRole('admin'),   
  ctrl.update
)

// ================================
// 📌 GENERAL ACCESS
// ================================
router.get(
  '/',
  protect,
  requireRole('admin'),   // 🔥 prevent everyone from seeing all submissions
  ctrl.list
)

router.get('/:id', protect, ctrl.get)

export default router
