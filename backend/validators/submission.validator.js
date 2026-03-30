import Joi from 'joi'
 
export const submissionSchema = Joi.object({
  campaignId:  Joi.string().required(),
  title:       Joi.string().min(3).max(120).required(),
  track:       Joi.string().required(),
  description: Joi.string().min(20).required(),
  githubUrl:   Joi.string().uri().allow(''),
  demoUrl:     Joi.string().uri().allow(''),
  fields:      Joi.object().default({}),
})
 