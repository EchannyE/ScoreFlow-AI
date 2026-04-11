import Joi from 'joi'

const score = Joi.number().integer().min(0).max(100).required()
const scores = Joi.object().pattern(/^[A-Za-z0-9_-]+$/, score).min(1)

export const createEvaluationSchema = Joi.object({
  submissionId: Joi.string().required(),
  campaignId: Joi.string().optional(),
  scores: scores.required(),
  note: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('draft', 'submitted').default('submitted'),
})

export const updateEvaluationSchema = Joi.object({
  scores: scores,
  note: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('draft', 'submitted'),
})
