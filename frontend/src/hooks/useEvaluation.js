import { useState, useEffect, useCallback } from 'react'
import { evaluationsAPI } from '../lib/api.jsx'

export function useEvaluatorQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await evaluationsAPI.myQueue()
      setQueue(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Failed to load evaluator queue')
      setQueue([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submitScore = async data => {
    try {
      const { data: evaluation } = await evaluationsAPI.create(data)
      setQueue(prev => prev.filter(s => s._id !== data.submissionId))
      return evaluation
    } catch (e) {
      throw new Error(e.response?.data?.message ?? e.message ?? 'Failed to submit evaluation')
    }
  }

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

  const load = useCallback(async () => {
    if (!submissionId) {
      setSubmission(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data } = await evaluationsAPI.getSubmission(submissionId)
      setSubmission(data)
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Failed to load submission')
      setSubmission(null)
    } finally {
      setLoading(false)
    }
  }, [submissionId])

  useEffect(() => {
    load()
  }, [load])

  return {
    submission,
    loading,
    error,
    refetch: load,
  }
}
