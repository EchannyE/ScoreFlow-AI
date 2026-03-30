import mongoose from 'mongoose'
 
const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  link:    String,
}, { timestamps: true })
 
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })
 
// Static helper — create a notification for a user in one line
notificationSchema.statics.push = function (userId, type, message, link) {
  return this.create({ userId, type, message, link })
}
 
export default mongoose.model('Notification', notificationSchema)