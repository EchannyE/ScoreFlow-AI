import Submission from '../models/Submissions.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { triggerAIEnrichment } from './enrichment.service.js'
import { submissionCreatedEmail } from './email.service.js'

// ================================
// 📌 GET ALL SUBMISSIONS
// ================================
export const list = (filters = {}) =>
  Submission.find(filters)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .sort({ createdAt: -1 })
    .lean()

// ================================
// 📌 GET SINGLE SUBMISSION
// ================================
export async function getById(id) {
  const sub = await Submission.findById(id)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()

  if (!sub) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  return sub
}

// ================================
// 📌 GET USER SUBMISSIONS
// ================================
export const mine = userId =>
  Submission.find({ submitterId: userId })
    .sort({ createdAt: -1 })
    .lean()

// ================================
// 📌 CREATE SUBMISSION
// ================================
export async function create(data, userId) {
  const sub = await Submission.create({
    ...data,
    submitterId: userId,
    status: 'submitted',
  })

  const created = await Submission.findById(sub._id)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()

  // =========================
  // 🧠 Async AI enrichment
  // =========================
  setImmediate(() => {
    triggerAIEnrichment(sub._id).catch(e => {
      console.error('AI enrichment error:', e.message)
    })
  })

  // =========================
  // 📧 Submission confirmation email
  // =========================
  if (created?.submitterId?.email) {
    submissionCreatedEmail({
      name: created.submitterId.name,
      email: created.submitterId.email,
      title: created.title,
      track: created.track,
    }).catch(err => {
      console.error('submission confirmation email failed:', err.message)
    })
  }

  // =========================
  // 🔗 Trigger n8n submission automation
  // Submission Created
  // → Email already handled here
  // → Slack (if high priority)
  // → WhatsApp (if critical)
  // =========================
  if (process.env.N8N_SUBMISSION_WEBHOOK) {
    fetch(process.env.N8N_SUBMISSION_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        event: 'submission.created',
        submissionId: created._id,
        title: created.title,
        track: created.track,
        status: created.status,
        submitterId: created.submitterId?._id,
        submitterName: created.submitterId?.name,
        submitterEmail: created.submitterId?.email,
        hasProjectUrl: Boolean(created.fields?.projectUrl),
        hasGithubUrl: Boolean(created.fields?.githubUrl),
        hasDemoUrl: Boolean(created.fields?.demoUrl),
        hasFileUrl: Boolean(created.fields?.fileUrl),
        fileCount: created.files?.length ?? 0,
        createdAt: created.createdAt,
      }),
    }).catch(err => {
      console.error('n8n submission webhook failed:', err.message)
    })
  }

  return created
}

// ================================
// 📌 UPDATE SUBMISSION
// ================================
export async function update(id, data) {
  const sub = await Submission.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()

  if (!sub) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  return sub
}

// ================================
// 📌 ASSIGN EVALUATOR
// ================================
export async function assignEvaluator(id, evaluatorId) {
  const [submission, evaluator] = await Promise.all([
    Submission.findById(id),
    User.findById(evaluatorId).lean(),
  ])

  if (!submission) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  if (!evaluator || evaluator.role !== 'evaluator' || evaluator.isActive === false) {
    throw Object.assign(new Error('Evaluator not found or inactive'), { status: 404 })
  }

  if (submission.status === 'completed') {
    throw Object.assign(new Error('Completed submissions cannot be reassigned'), { status: 400 })
  }

  submission.assignedEvaluatorId = evaluator._id
  submission.assignedAt = new Date()
  submission.status = 'under_review'

  await submission.save()

  await Notification.push(
    evaluator._id,
    'info',
    `New evaluation assignment: ${submission.title}`,
    `/evaluator/score/${submission._id}`
  )

  if (process.env.N8N_ASSIGNMENT_WEBHOOK) {
    fetch(process.env.N8N_ASSIGNMENT_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        event: 'submission.assigned',
        submissionId: submission._id,
        evaluatorId: evaluator._id,
        evaluatorName: evaluator.name,
        evaluatorEmail: evaluator.email,
      }),
    }).catch(err => {
      console.error('n8n assignment webhook failed:', err.message)
    })
  }

  return Submission.findById(submission._id)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()
}

// ================================
// 📌 MARK SUBMISSION AS SCORED
// ================================
export async function markAsScored(submissionId, finalScore) {
  const sub = await Submission.findById(submissionId)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')

  if (!sub) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  sub.finalScore = finalScore
  sub.status = 'completed'
  sub.scoredAt = new Date()

  await sub.save()

  // =========================
  // 🔗 Trigger n8n score-release automation
  // Submission Scored
  // → Email handled in evaluation.service.js
  // → Slack (if top score)
  // =========================
  if (process.env.N8N_SCORE_RELEASE_WEBHOOK) {
    fetch(process.env.N8N_SCORE_RELEASE_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        event: 'submission.scored',
        submissionId: sub._id,
        title: sub.title,
        track: sub.track,
        finalScore: sub.finalScore,
        topScore: sub.finalScore >= 85,
        submitterId: sub.submitterId?._id,
        submitterName: sub.submitterId?.name,
        submitterEmail: sub.submitterId?.email,
        evaluatorId: sub.assignedEvaluatorId?._id,
        evaluatorName: sub.assignedEvaluatorId?.name,
        evaluatorEmail: sub.assignedEvaluatorId?.email,
        scoredAt: sub.scoredAt,
      }),
    }).catch(err => {
      console.error('n8n score release webhook failed:', err.message)
    })
  }

  return sub.toObject()
}
