const express = require('express');
const campaignRoutes = require('./campaignRoutes');
const evaluationRoutes = require('./evaluation.routes');
const notificationRoutes = require('./notification.routes');
const submissionRoutes = require('./submissionRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/campaigns', campaignRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/submissions', submissionRoutes);
router.use('/users', userRoutes);

module.exports = router;