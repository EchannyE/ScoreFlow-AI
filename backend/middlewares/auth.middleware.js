import jwt  from 'jsonwebtoken'
import User from '../models/User.js'
 
export async function protect(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' })
  }
 
  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    if (!req.user?.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' })
    }
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
 
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Requires role: ${roles.join(' or ')}` })
    }
    next()
  }
}
 