import { toOperationalLogMessage, toPublicError } from '../utils/errorMessage.js'

const errorHandler = (err, req, res, _next) => {
  console.error(`[${req.method}] ${req.path} —`, toOperationalLogMessage(err))
 
  const { status, message } = toPublicError(err)
 
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
 
export default errorHandler