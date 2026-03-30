import * as authService from '../services/auth.service.js'
import { ok, fail }       from '../utils/aiResponse.js'
 
export const register = async (req, res) => {
  try { ok(res, await authService.register(req.body), 201) }
  catch (e) { fail(res, e) }
}
 
export const login = async (req, res) => {
  try { ok(res, await authService.login(req.body)) }
  catch (e) { fail(res, e) }
}
 
export const me = async (req, res) => {
  try { ok(res, { user: await authService.getMe(req.user._id) }) }
  catch (e) { fail(res, e) }
}
 