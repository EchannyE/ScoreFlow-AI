import * as notificationService from '../services/notification.service.js'
import { ok, fail }               from '../utils/aiResponse.js'
 
export const list = async (req, res) => {
  try { ok(res, await notificationService.listForUser(req.user._id)) }
  catch (e) { fail(res, e) }
}
 
export const markRead = async (req, res) => {
  try { await notificationService.markRead(req.params.id, req.user._id); ok(res, { success: true }) }
  catch (e) { fail(res, e) }
}
 
export const markAllRead = async (req, res) => {
  try { await notificationService.markAllRead(req.user._id); ok(res, { success: true }) }
  catch (e) { fail(res, e) }
}
 