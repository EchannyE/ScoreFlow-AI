import Submission from '../models/Submissions.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { triggerAIEnrichment } from './enrichment.service.js'

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

  // Run AI enrichment asynchronously
  setImmediate(() => {
    triggerAIEnrichment(sub._id).catch(e => {
      console.error('AI enrichment error:', e.message)
    })
  })

  // Trigger n8n submission automation
  if (process.env.N8N_SUBMISSION_WEBHOOK) {
    fetch(process.env.N8N_SUBMISSION_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        submissionId: sub._id,
      }),
    }).catch(err => {
      console.error('n8n submission webhook failed:', err.message)
    })
  }

  return Submission.findById(sub._id)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()
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
        submissionId: submission._id,
        evaluatorId: evaluator._id,
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

  if (!sub) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  sub.finalScore = finalScore
  sub.status = 'completed'
  sub.scoredAt = new Date()

  await sub.save()

  if (process.env.N8N_SCORE_RELEASE_WEBHOOK) {
    fetch(process.env.N8N_SCORE_RELEASE_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        submissionId: sub._id,
      }),
    }).catch(err => {
      console.error('n8n score release webhook failed:', err.message)
    })
  }

  return sub
}  }

  return sub
}

// ================================
// 📌 UPDATE SUBMISSION
// ================================
export async function update(id, data) {
  const sub = await Submission.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  })

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

  // 🔔 In-app notification
  await Notification.push(
    evaluator._id,
    'info',
    `New evaluation assignment: ${submission.title}`,
    `/evaluator/score/${submission._id}`
  )

  // 🔗 Optional: trigger automation (future use)
  if (process.env.N8N_ASSIGNMENT_WEBHOOK) {
    fetch(process.env.N8N_ASSIGNMENT_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        submissionId: submission._id,
        evaluatorId: evaluator._id
      }),
    }).catch(() => {})
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
import Submission from '../models/Submissions.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { triggerAIEnrichment } from './enrichment.service.js'

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

  // Run AI enrichment asynchronously
  setImmediate(() => {
    triggerAIEnrichment(sub._id).catch(e => {
      console.error('AI enrichment error:', e.message)
    })
  })

  // Trigger n8n submission automation
  if (process.env.N8N_SUBMISSION_WEBHOOK) {
    fetch(process.env.N8N_SUBMISSION_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        submissionId: sub._id,
      }),
    }).catch(err => {
      console.error('n8n submission webhook failed:', err.message)
    })
  }

  return Submission.findById(sub._id)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()
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
        submissionId: submission._id,
        evaluatorId: evaluator._id,
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

  if (!sub) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  sub.finalScore = finalScore
  sub.status = 'completed'
  sub.scoredAt = new Date()

  await sub.save()

  if (process.env.N8N_SCORE_RELEASE_WEBHOOK) {
    fetch(process.env.N8N_SCORE_RELEASE_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        submissionId: sub._id,
      }),
    }).catch(err => {
      console.error('n8n score release webhook failed:', err.message)
    })
  }

  return sub
}
