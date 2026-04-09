import Evaluation   from '../models/Evaluation.js'
import Submission   from '../models/Submissions.js'
import Notification from '../models/Notification.js'
import { markAsScored } from './submissions.service.js'

// ================================
// 📌 GET EVALUATION QUEUE
// ================================
export async function getQueue(evaluatorId) {
  const done = await Evaluation.find({ evaluatorId }).distinct('submissionId')

  return Submission.find({
    assignedEvaluatorId: evaluatorId,
    status: { $in: ['submitted', 'under_review'] },
    _id: { $nin: done },
  })
    .populate('submitterId', 'name')
    .sort({ createdAt: 1 })
    .lean()
}

// ================================
// 📌 LIST EVALUATIONS
// ================================
export const list = (filters = {}) =>
  Evaluation.find(filters)
    .populate('evaluatorId', 'name')
    .sort({ createdAt: -1 })
    .lean()

// ================================
// 📌 CREATE EVALUATION (CRITICAL FLOW)
// ================================
export async function create(data, evaluatorId) {
  const submission = await Submission.findById(data.submissionId)

  if (!submission) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  if (String(submission.assignedEvaluatorId) !== String(evaluatorId)) {
    throw Object.assign(new Error('This submission is not assigned to you'), { status: 403 })
  }

  if (submission.status === 'completed') {
    throw Object.assign(new Error('Submission already completed'), { status: 400 })
  }

  // ✅ Prevent duplicate evaluation
  const existing = await Evaluation.findOne({
    submissionId: data.submissionId,
    evaluatorId
  })

  if (existing) {
    throw Object.assign(new Error('You have already evaluated this submission'), { status: 400 })
  }

  // =========================
  // 🔥 CREATE EVALUATION
  // =========================
  const evaluation = await Evaluation.create({
    ...data,
    evaluatorId
  })

  // =========================
  // 🔥 FINALIZE SUBMISSION
  // =========================
  await markAsScored(
    data.submissionId,
    evaluation.weightedScore
  )

  // =========================
  // 🔔 NOTIFICATION
  // =========================
  await Notification.push(
    evaluatorId,
    'success',
    `Evaluation submitted — score: ${evaluation.weightedScore}`
  )

  return evaluation
}