import mongoose from 'mongoose'
import bcrypt     from 'bcrypt'
import jwt        from 'jsonwebtoken'
 
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['admin', 'evaluator', 'submitter'], default: 'submitter' },
  expertise: [String],
  isActive:  { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true })
 
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})
 
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}
 
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
  )
}
 
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}
 
export default mongoose.model('User', userSchema)