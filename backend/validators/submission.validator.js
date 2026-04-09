import Joi from 'joi'

export const submissionSchema = Joi.object({
  campaignId: Joi.string().required(),
  title: Joi.string().min(3).max(120).required(),
  track: Joi.string().required(),

  fields: Joi.object({
    description: Joi.string().min(20).required(),
    projectUrl: Joi.string().uri().allow(''),
    githubUrl: Joi.string().uri().allow(''),
    demoUrl: Joi.string().uri().allow(''),
    fileUrl: Joi.string().uri().allow(''),
    fileName: Joi.string().allow(''),
  }).required(),
})
