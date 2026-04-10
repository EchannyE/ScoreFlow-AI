import User from '../models/User.js'

function sanitizeUser(user) {
  if (!user) return null

  const obj =
    typeof user.toObject === 'function'
      ? user.toObject()
      : { ...user }

  delete obj.password
  return obj
}

export async function register({ name, email, password, role }) {
  const exists = await User.findOne({ email })

  if (exists) {
    throw Object.assign(new Error('Email already registered'), { status: 409 })
  }

  const user = await User.create({ name, email, password, role })

  return {
    token: user.generateToken(),
    user: sanitizeUser(user),
  }
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 })
  }

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  return {
    token: user.generateToken(),
    user: sanitizeUser(user),
  }
}

export async function getMe(userId) {
  const user = await User.findById(userId)

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 })
  }

  return sanitizeUser(user)
}
