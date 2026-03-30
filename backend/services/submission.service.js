import Submission from '../models/Submissions.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { triggerAIEnrichment } from './enrichment.service.js'
 
export const list = (filters = {}) =>
  Submission.find(filters)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .sort({ createdAt: -1 })
    .lean()
 
export async function getById(id) {
  const sub = await Submission.findById(id)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()
  if (!sub) throw Object.assign(new Error('Submission not found'), { status: 404 })
  return sub
}
 
export const mine = userId =>
  Submission.find({ submitterId: userId }).sort({ createdAt: -1 }).lean()
 
export async function create(data, userId, userInfo = {}) {
  const sub = await Submission.create({ ...data, submitterId: userId })
 
  // Fire-and-forget — submission confirms instantly, AI runs async
  triggerAIEnrichment(sub._id).catch(e =>
    console.error('AI enrichment error:', e.message)
  )
 
  // Notify n8n automation for confirmation email
  if (process.env.N8N_SUBMISSION_WEBHOOK) {
    fetch(process.env.N8N_SUBMISSION_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        submissionId: sub._id,
        title: sub.title,
        ...userInfo,
      }),
    }).catch(() => {})
  }
 
  return sub
}
 
export async function update(id, data) {
  const sub = await Submission.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!sub) throw Object.assign(new Error('Submission not found'), { status: 404 })
  return sub
}

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

  if (submission.status === 'scored') {
    throw Object.assign(new Error('Scored submissions cannot be reassigned'), { status: 400 })
  }

  submission.assignedEvaluatorId = evaluator._id
  submission.assignedAt = new Date()
  submission.status = 'under_review'
  await submission.save()

  await Notification.push(
    evaluator._id,
    'info',
    `New evaluation assignment: ${submission.title}`,
    `/evaluator/score/${submission._id}`,
  )

  return Submission.findById(submission._id)
    .populate('submitterId', 'name email')
    .populate('assignedEvaluatorId', 'name email expertise')
    .lean()
}
 