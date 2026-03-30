import * as submissionService from '../services/submission.service.js'
import { ok, fail }             from '../utils/aiResponse.js'
 
export const list = async (req, res) => {
  try {
    const filters = {}
    if (req.query.campaignId) filters.campaignId = req.query.campaignId
    if (req.query.status)     filters.status     = req.query.status
    if (req.query.flagged)    filters.flagged     = req.query.flagged === 'true'
    ok(res, { submissions: await submissionService.list(filters) })
  } catch (e) { fail(res, e) }
}
 
export const get = async (req, res) => {
  try { ok(res, await submissionService.getById(req.params.id)) }
  catch (e) { fail(res, e) }
}
 
export const mine = async (req, res) => {
  try { ok(res, await submissionService.mine(req.user._id)) }
  catch (e) { fail(res, e) }
}
 
export const create = async (req, res) => {
  try {
    const userInfo = { submitterEmail: req.user.email, submitterName: req.user.name }
    ok(res, await submissionService.create(req.body, req.user._id, userInfo), 201)
  } catch (e) { fail(res, e) }
}
 
export const update = async (req, res) => {
  try { ok(res, await submissionService.update(req.params.id, req.body)) }
  catch (e) { fail(res, e) }
}

export const assign = async (req, res) => {
  try {
    ok(res, await submissionService.assignEvaluator(req.params.id, req.body.evaluatorId))
  } catch (e) { fail(res, e) }
}
 