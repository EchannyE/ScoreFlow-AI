import { Router }             from 'express'
import User                     from '../models/User.js'
import { protect, requireRole } from '../middlewares/auth.middleware.js'
import { ok, fail }             from '../utils/aiResponse.js'
 
const router = Router()
 
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const filters = {}
    if (req.query.role) filters.role = req.query.role
    ok(res, { users: await User.find(filters).lean() })
  } catch (e) { fail(res, e) }
})
 
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return fail(res, { status: 404, message: 'Not found' })
    ok(res, user)
  } catch (e) { fail(res, e) }
})
 
export default router