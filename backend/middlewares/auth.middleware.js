import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ================================
// 📌 AUTH MIDDLEWARE
// ================================
export async function protect(req, res, next) {
  try {
    let token = null

    // 1. Standard Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // 2. Fallback for n8n / proxies (optional but very useful)
    if (!token && req.headers['x-access-token']) {
      token = req.headers['x-access-token']
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated - no token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: err.message, // 🔥 helps debugging in n8n
    })
  }
}

// ================================
// 📌 ROLE GUARD
// ================================
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Requires role: ${roles.join(' or ')}`,
        currentRole: req.user.role, // 🔥 debug visibility
      })
    }

    next()
  }
}
