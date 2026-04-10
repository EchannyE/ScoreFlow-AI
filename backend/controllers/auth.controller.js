import * as authService from '../services/auth.service.js'
import { ok, fail } from '../utils/aiResponse.js'

// ================================
// 📌 REGISTER
// ================================
export const register = async (req, res) => {
  try {
    ok(res, await authService.register(req.body), 201)
  } catch (e) {
    fail(res, e)
  }
}

// ================================
// 📌 LOGIN
// ================================
export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body)

    // Optional: expose role for n8n / frontend workflows
    ok(res, {
      token: result.token,
      user: result.user,
      role: result.user.role, // 🔥 useful for automation logic
    })
  } catch (e) {
    fail(res, e)
  }
}

// ================================
// 📌 CURRENT USER
// ================================
export const me = async (req, res) => {
  try {
    const user = await authService.getMe(req.user._id)

    ok(res, {
      user,
      role: user.role, // 🔥 important for role-based flows (n8n, frontend)
    })
  } catch (e) {
    fail(res, e)
  }
}
