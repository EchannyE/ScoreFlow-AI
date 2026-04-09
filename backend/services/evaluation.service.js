import Evaluation from '../models/Evaluation.js'
import Submission from '../models/Submissions.js'
import Notification from '../models/Notification.js'
import { markAsScored } from './submission.service.js'

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
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .sort({ createdAt: 1 })
    .lean()
}

// ================================
// 📌 GET ONE ASSIGNED SUBMISSION
// ================================
export async function getAssignedSubmission(submissionId, evaluatorId) {
  const submission = await Submission.findById(submissionId)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()

  if (!submission) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  const assignedId =
    submission.assignedEvaluatorId?._id || submission.assignedEvaluatorId

  if (String(assignedId) !== String(evaluatorId)) {
    throw Object.assign(
      new Error('You are not allowed to view this submission'),
      { status: 403 }
    )
  }

  return submission
}

// ================================
// 📌 LIST EVALUATIONS
// ================================
export const list = (filters = {}) =>
  Evaluation.find(filters)
    .populate('evaluatorId', 'name')
    .populate('submissionId', 'title track status')
    .sort({ createdAt: -1 })
    .lean()

// ================================
// 📌 CREATE EVALUATION
// ================================
export async function create(data, evaluatorId) {
  const submission = await Submission.findById(data.submissionId)

  if (!submission) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  if (String(submission.assignedEvaluatorId) !== String(evaluatorId)) {
    throw Object.assign(
      new Error('This submission is not assigned to you'),
      { status: 403 }
    )
  }

  if (submission.status === 'completed') {
    throw Object.assign(new Error('Submission already completed'), {
      status: 400,
    })
  }

  const existing = await Evaluation.findOne({
    submissionId: data.submissionId,
    evaluatorId,
  })

  if (existing) {
    throw Object.assign(
      new Error('You have already evaluated this submission'),
      { status: 400 }
    )
  }

  const evaluation = await Evaluation.create({
    submissionId: data.submissionId,
    campaignId: data.campaignId || submission.campaignId,
    evaluatorId,
    scores: data.scores,
    note: data.note || '',
    status: data.status || 'submitted',
  })

  await markAsScored(data.submissionId, evaluation.weightedScore)

  await Notification.push(
    evaluatorId,
    'success',
    `Evaluation submitted — score: ${evaluation.weightedScore}`
  )

  return evaluation
}
