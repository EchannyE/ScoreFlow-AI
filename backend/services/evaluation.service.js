import Evaluation from '../models/Evaluation.js'
import Submission from '../models/Submissions.js'
import Notification from '../models/Notification.js'
import { markAsScored } from './submission.service.js'
import { submissionScoredEmail } from './email.service.js'

function getCampaignId(value) {
  return value?._id || value
}

function getCampaignRubric(submission) {
  return Array.isArray(submission?.campaignId?.rubric)
    ? submission.campaignId.rubric
        .filter(item => item?.id)
        .map(item => ({
          id: String(item.id),
          weight: Number(item.weight) || 0,
          label: item.label || item.id,
        }))
    : []
}

function validateScores(scores, rubric) {
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) {
    throw Object.assign(new Error('Scores are required'), { status: 400 })
  }

  if (!rubric.length) {
    throw Object.assign(new Error('Campaign rubric is not configured'), {
      status: 400,
    })
  }

  const rubricIds = rubric.map(item => item.id)
  const scoreKeys = Object.keys(scores)
  const missing = rubricIds.filter(id => !(id in scores))
  const extras = scoreKeys.filter(key => !rubricIds.includes(key))

  if (missing.length || extras.length) {
    throw Object.assign(
      new Error('Scores must match the campaign rubric exactly'),
      { status: 400 }
    )
  }

  for (const rubricItem of rubric) {
    const rawValue = scores[rubricItem.id]
    const value = Number(rawValue)

    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw Object.assign(
        new Error(`Invalid score for ${rubricItem.label}`),
        { status: 400 }
      )
    }
  }
}

function validateCampaignReference(inputCampaignId, submissionCampaignId) {
  if (!inputCampaignId) {
    return
  }

  if (String(inputCampaignId) !== String(submissionCampaignId)) {
    throw Object.assign(new Error('Campaign does not match submission'), {
      status: 400,
    })
  }
}

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
    .populate('campaignId', 'title rubric')
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
    .populate('evaluatorId', 'name email')
    .populate('submissionId', 'title track status finalScore')
    .sort({ createdAt: -1 })
    .lean()

// ================================
// 📌 GET SINGLE EVALUATION
// ================================
export async function getById(id) {
  const evaluation = await Evaluation.findById(id)
    .populate('evaluatorId', 'name email')
    .populate('submissionId', 'title track status finalScore')
    .lean()

  if (!evaluation) {
    throw Object.assign(new Error('Evaluation not found'), { status: 404 })
  }

  return evaluation
}

// ================================
// 📌 CREATE EVALUATION
// ================================
export async function create(data, evaluatorId) {
  const submission = await Submission.findById(data.submissionId)
    .populate('campaignId', 'title rubric')
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')

  if (!submission) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  const campaignId = getCampaignId(submission?.campaignId)
  validateCampaignReference(data.campaignId, campaignId)
  validateScores(data.scores, getCampaignRubric(submission))

  if (String(submission.assignedEvaluatorId?._id || submission.assignedEvaluatorId) !== String(evaluatorId)) {
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
    campaignId,
    evaluatorId,
    scores: data.scores,
    note: data.note || '',
    status: data.status || 'submitted',
  })

  if (evaluation.status === 'submitted') {
    const scoredSubmission = await markAsScored(
      data.submissionId,
      evaluation.weightedScore
    )

    await Notification.push(
      evaluatorId,
      'success',
      `Evaluation submitted — score: ${evaluation.weightedScore}`
    )

    if (submission.submitterId?.email) {
      submissionScoredEmail({
        name: submission.submitterId.name,
        email: submission.submitterId.email,
        title: submission.title,
        score: evaluation.weightedScore,
        track: submission.track,
        topScore: evaluation.weightedScore >= 85,
      }).catch(err => {
        console.error('submission scored email failed:', err.message)
      })
    }

    return Evaluation.findById(evaluation._id)
      .populate('evaluatorId', 'name email')
      .populate('submissionId', 'title track status finalScore')
      .lean()
  }

  return Evaluation.findById(evaluation._id)
    .populate('evaluatorId', 'name email')
    .populate('submissionId', 'title track status finalScore')
    .lean()
}

// ================================
// 📌 UPDATE EVALUATION
// ================================
export async function update(id, data, evaluatorId) {
  const evaluation = await Evaluation.findById(id)

  if (!evaluation) {
    throw Object.assign(new Error('Evaluation not found'), { status: 404 })
  }

  if (String(evaluation.evaluatorId) !== String(evaluatorId)) {
    throw Object.assign(
      new Error('You are not allowed to update this evaluation'),
      { status: 403 }
    )
  }

  if (evaluation.status === 'submitted') {
    throw Object.assign(
      new Error('Submitted evaluations cannot be edited'),
      { status: 400 }
    )
  }

  if (data.scores) {
    const submission = await Submission.findById(evaluation.submissionId)
      .populate('campaignId', 'title rubric')

    if (!submission) {
      throw Object.assign(new Error('Submission not found'), { status: 404 })
    }

    validateScores(data.scores, getCampaignRubric(submission))
  }

  if (data.scores) evaluation.scores = data.scores
  if (data.note !== undefined) evaluation.note = data.note
  if (data.status) evaluation.status = data.status

  await evaluation.save()

  if (evaluation.status === 'submitted') {
    const submission = await Submission.findById(evaluation.submissionId)
      .populate('submitterId', 'name email')
      .populate('assignedEvaluatorId', 'name email expertise')

    const scoredSubmission = await markAsScored(
      evaluation.submissionId,
      evaluation.weightedScore
    )

    await Notification.push(
      evaluatorId,
      'success',
      `Evaluation submitted — score: ${evaluation.weightedScore}`
    )

    if (submission?.submitterId?.email) {
      submissionScoredEmail({
        name: submission.submitterId.name,
        email: submission.submitterId.email,
        title: submission.title,
        score: evaluation.weightedScore,
        track: submission.track,
        topScore: evaluation.weightedScore >= 85,
      }).catch(err => {
        console.error('submission scored email failed:', err.message)
      })
    }
  }

  return Evaluation.findById(evaluation._id)
    .populate('evaluatorId', 'name email')
    .populate('submissionId', 'title track status finalScore')
    .lean()
}
