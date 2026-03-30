import User from '../models/User.js'
 
export async function register({ name, email, password, role }) {
  const exists = await User.findOne({ email })
  if (exists) throw Object.assign(new Error('Email already registered'), { status: 409 })
 
  const user = await User.create({ name, email, password, role })
  return { token: user.generateToken(), user }
}
 
export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 })
  }
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })
  return { token: user.generateToken(), user }
}
 
export async function getMe(userId) {
  return User.findById(userId)
}
 