import { Router } from 'express'
import * as ctrl from '../controllers/evaluation.controller.js'
import { protect, requireRole } from '../middlewares/auth.middleware.js'
import validate from '../middlewares/validate.middleware.js'
import {
  createEvaluationSchema,
  updateEvaluationSchema,
} from '../validators/evaluation.validator.js'

const router = Router()

router.get(
  '/my-queue',
  protect,
  requireRole('evaluator'),
  ctrl.myQueue
)

router.get(
  '/submission/:submissionId',
  protect,
  requireRole('evaluator'),
  ctrl.getAssignedSubmission
)

router.post(
  '/',
  protect,
  requireRole('evaluator'),
  validate(createEvaluationSchema),
  ctrl.create
)

router.patch(
  '/:id',
  protect,
  requireRole('evaluator'),
  validate(updateEvaluationSchema),
  ctrl.update
)

router.get(
  '/:id',
  protect,
  ctrl.get
)

router.get(
  '/',
  protect,
  requireRole('admin'),
  ctrl.list
)

export default router
