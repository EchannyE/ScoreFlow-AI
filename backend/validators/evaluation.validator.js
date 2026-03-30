import Joi from 'joi'
 
const score = Joi.number().integer().min(0).max(100).required()
 
export const evaluationSchema = Joi.object({
  submissionId: Joi.string().required(),
  campaignId:   Joi.string().required(),
  scores: Joi.object({
    innovation:   score,
    feasibility:  score,
    impact:       score,
    presentation: score,
  }).required(),
  note:   Joi.string().max(1_000).allow(''),
  status: Joi.string().valid('draft', 'submitted').default('submitted'),
})
 