import { toPublicError } from '../utils/errorMessage.js'

import mongoose from 'mongoose'
 
function isTrue(value) {
  return String(value).trim().toLowerCase() === 'true'
}

function getMongoOptions() {
  const timeout = Number.parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? '5000', 10)
  const options = {
    serverSelectionTimeoutMS: Number.isFinite(timeout) ? timeout : 5000,
  }

  if (isTrue(process.env.MONGODB_FORCE_IPV4)) {
    options.family = 4
  }

  return options
}

function logAtlasConnectionHelp(error, uri) {
  if (!uri.includes('.mongodb.net')) {
    return
  }

  const details = [
    error?.message,
    error?.cause?.message,
    error?.reason?.message,
  ].filter(Boolean).join(' ').toLowerCase()

  if (!details.includes('server selection') && !details.includes('ssl') && !details.includes('tls')) {
    return
  }

  console.error('MongoDB Atlas connection failed.')
  console.error('Check these items and retry:')
  console.error('  1. Add your current public IP to Atlas Network Access, or allow 0.0.0.0/0 temporarily for local testing.')
  console.error('  2. Confirm the Atlas cluster is running and the database user in MONGODB_URI still exists.')
  console.error('  3. If you are on a restricted network, try another network or set MONGODB_FORCE_IPV4=true in backend/.env.')
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim()

  if (!uri) {
    throw new Error('MONGODB_URI is missing')
  }

  try {
    await mongoose.connect(uri, getMongoOptions())
    console.log('MongoDB connected:')
  } catch (error) {
    logAtlasConnectionHelp(error, uri)
    const publicError = toPublicError(error)
    throw Object.assign(new Error(publicError.message), {
      status: publicError.status,
      cause: error,
    })
  }
}
 
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'))
mongoose.connection.on('reconnected',  () => console.log('MongoDB reconnected'))
mongoose.connection.on('error', error => console.error('MongoDB connection error:', error.message))