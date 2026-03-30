import Evaluation   from '../models/Evaluation.js'
import Submission   from '../models/Submissions.js'
import Notification from '../models/Notification.js'
 
export async function getQueue(evaluatorId) {
  // Submissions this evaluator has already scored
  const done = await Evaluation.find({ evaluatorId }).distinct('submissionId')
 
  return Submission.find({
    assignedEvaluatorId: evaluatorId,
    status: { $in: ['submitted', 'under_review'] },
    _id:    { $nin: done },
  })
    .populate('submitterId', 'name')
    .sort({ createdAt: 1 })
    .lean()
}
 
export const list = (filters = {}) =>
  Evaluation.find(filters)
    .populate('evaluatorId', 'name')
    .sort({ createdAt: -1 })
    .lean()
 
export async function create(data, evaluatorId) {
  const submission = await Submission.findById(data.submissionId).lean()

  if (!submission) {
    throw Object.assign(new Error('Submission not found'), { status: 404 })
  }

  if (String(submission.assignedEvaluatorId) !== String(evaluatorId)) {
    throw Object.assign(new Error('This submission is not assigned to you'), { status: 403 })
  }

  const evaluation = await Evaluation.create({ ...data, evaluatorId })
 
  // Mark submission as scored and store final weighted score
  await Submission.findByIdAndUpdate(data.submissionId, {
    status:     'scored',
    finalScore: evaluation.weightedScore,
  })
 
  // Notify admin of new score
  await Notification.push(
    evaluatorId,
    'success',
    `Evaluation submitted — weighted score: ${evaluation.weightedScore}`
  )
 
  return evaluation
}
 
 