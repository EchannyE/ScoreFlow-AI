import * as campaignService from '../services/campaign.service.js'
import { ok, fail }           from '../utils/aiResponse.js'
 
export const list = async (req, res) => {
  try {
    const filters = {}
    if (req.query.status) filters.status = req.query.status
    ok(res, { campaigns: await campaignService.list(filters) })
  } catch (e) { fail(res, e) }
}
 
export const get = async (req, res) => {
  try { ok(res, await campaignService.getById(req.params.id)) }
  catch (e) { fail(res, e) }
}
 
export const create = async (req, res) => {
  try { ok(res, await campaignService.create(req.body, req.user._id), 201) }
  catch (e) { fail(res, e) }
}
 
export const update = async (req, res) => {
  try { ok(res, await campaignService.update(req.params.id, req.body)) }
  catch (e) { fail(res, e) }
}
 
export const remove = async (req, res) => {
  try { await campaignService.remove(req.params.id); ok(res, { message: 'Campaign deleted' }) }
  catch (e) { fail(res, e) }
}
 
export const stats = async (req, res) => {
  try { ok(res, await campaignService.getStats(req.params.id)) }
  catch (e) { fail(res, e) }
}
 