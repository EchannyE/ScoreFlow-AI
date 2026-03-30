import Notification from '../models/Notification.js'
 
export const listForUser = userId =>
  Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean()
 
export const markRead = (id, userId) =>
  Notification.findOneAndUpdate({ _id: id, userId }, { read: true })
 
export const markAllRead = userId =>
  Notification.updateMany({ userId }, { read: true })
 
 