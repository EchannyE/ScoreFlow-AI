import { useState, useEffect, useCallback } from 'react'
import { evaluationsAPI } from '../lib/api.jsx'

const AUTO_REFRESH_MS = 15000

export function useEvaluatorQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true)
      setError(null)

      const { data } = await evaluationsAPI.myQueue()
      setQueue(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(
        e.response?.data?.message ??
        e.message ??
        'Failed to load evaluator queue'
      )
      if (!background) setQueue([])
    } finally {
      if (!background) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void load({ background: true })
      }
    }

    const intervalId = window.setInterval(refresh, AUTO_REFRESH_MS)

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [load])

  const submitScore = useCallback(async payload => {
    try {
      const { data: evaluation } = await evaluationsAPI.create(payload)

      setQueue(prev =>
        prev.filter(submission => submission._id !== payload.submissionId)
      )

      return evaluation
    } catch (e) {
      throw new Error(
        e.response?.data?.message ??
        e.message ??
        'Failed to submit evaluation'
      )
    }
  }, [])

  return {
    queue,
    loading,
    error,
    refetch: load,
    submitScore,
  }
}

export function useAssignedSubmission(submissionId) {
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async ({ background = false } = {}) => {
    if (!submissionId) {
      setSubmission(null)
      setLoading(false)
      return
    }

    try {
      if (!background) setLoading(true)
      setError(null)

      const { data } = await evaluationsAPI.getSubmission(submissionId)
      setSubmission(data)
    } catch (e) {
      setError(
        e.response?.data?.message ??
        e.message ??
        'Failed to load submission'
      )
      if (!background) setSubmission(null)
    } finally {
      if (!background) setLoading(false)
    }
  }, [submissionId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!submissionId) return undefined

    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void load({ background: true })
      }
    }

    const intervalId = window.setInterval(refresh, AUTO_REFRESH_MS)

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [load, submissionId])

  return {
    submission,
    loading,
    error,
    refetch: load,
  }
}
