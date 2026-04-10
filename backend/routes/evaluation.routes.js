
import { Router } from 'express'
import * as ctrl from '../controllers/evaluation.controller.js'
import { protect, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

// Evaluator queue
router.get(
  '/my-queue',
  protect,
  requireRole('evaluator'),
  ctrl.myQueue
)

// Assigned submission
router.get(
  '/submission/:submissionId',
  protect,
  requireRole('evaluator'),
  ctrl.getAssignedSubmission
)

// Create evaluation
router.post(
  '/',
  protect,
  requireRole('evaluator'),
  ctrl.create
)

// Update evaluation (draft → submitted)
router.patch(
  '/:id',
  protect,
  requireRole('evaluator'),
  ctrl.update
)

// Get single evaluation
router.get(
  '/:id',
  protect,
  ctrl.getById
)

// List evaluations (admin only)
router.get(
  '/',
  protect,
  requireRole('admin'),
  ctrl.list
)

export default router
