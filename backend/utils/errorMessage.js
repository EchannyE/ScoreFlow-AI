const DATABASE_ERROR_PATTERNS = [
  /mongoose(serverselection|network|timeout)/i,
  /mongo(network|serverselection|timeout|parse|error)/i,
  /getaddrinfo\s+enotfound/i,
  /querysrv/i,
  /eai_again/i,
  /econnrefused/i,
  /\.mongodb\.net/i,
]

function collectErrorDetails(error) {
  return [
    error?.name,
    error?.message,
    error?.cause?.name,
    error?.cause?.message,
    error?.reason?.name,
    error?.reason?.message,
    error?.errorResponse?.errmsg,
  ].filter(Boolean).join(' ')
}

function isDatabaseConnectionError(error) {
  const details = collectErrorDetails(error)
  return DATABASE_ERROR_PATTERNS.some(pattern => pattern.test(details))
}

export function toPublicError(error) {
  if (isDatabaseConnectionError(error)) {
    return {
      status: error?.status ?? error?.statusCode ?? 503,
      message: 'Database service is temporarily unavailable. Please try again shortly.',
    }
  }

  return {
    status: error?.status ?? error?.statusCode ?? 500,
    message: error?.message ?? 'Internal server error',
  }
}

export function toOperationalLogMessage(error) {
  if (isDatabaseConnectionError(error)) {
    return 'Database service is temporarily unavailable.'
  }

  return error?.message ?? 'Internal server error'
}