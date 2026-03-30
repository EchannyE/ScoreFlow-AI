import express from 'express'
import campaignRoutes from './campaignRoutes.js'
import evaluationRoutes from './evaluation.routes.js'
import notificationRoutes from './notification.routes.js'
import submissionRoutes from './submissionRoutes.js'
import userRoutes from './userRoutes.js'

const router = express.Router()

router.use('/campaigns', campaignRoutes)
router.use('/evaluations', evaluationRoutes)
router.use('/notifications', notificationRoutes)
router.use('/submissions', submissionRoutes)
router.use('/users', userRoutes)

export default router
