import { toPublicError } from './errorMessage.js'

export const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data })
 
export const fail = (res, err) => {
  const { status, message } = toPublicError(err)
  return res.status(status).json({ success: false, message })
}
 