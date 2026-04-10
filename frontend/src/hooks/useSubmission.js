import { useState, useEffect, useCallback, useMemo } from 'react'
import { submissionsAPI } from '../lib/api.jsx'

const AUTO_REFRESH_MS = 15000

function normalizeSubmissionList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.submissions)) return payload.submissions
  return []
}

export function useSubmissions(params = {}) {
  const paramsKey = JSON.stringify(params)
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey])

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true)
      setError(null)

      const response = await submissionsAPI.list(stableParams)
      setSubmissions(normalizeSubmissionList(response.data))
    } catch (e) {
      setError(
        e.response?.data?.message ??
        e.message ??
        'Failed to load submissions'
      )
      if (!background) setSubmissions([])
    } finally {
      if (!background) setLoading(false)
    }
  }, [stableParams])

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

  const createSubmission = useCallback(async data => {
    try {
      const response = await submissionsAPI.create(data)
      const created = response.data

      setSubmissions(prev => [created, ...prev])
      return created
    } catch (e) {
      throw new Error(
        e.response?.data?.message ??
        e.message ??
        'Failed to create submission'
      )
    }
  }, [])

  const assignSubmission = useCallback(async (submissionId, evaluatorId) => {
    try {
      const response = await submissionsAPI.assign(submissionId, evaluatorId)
      const updated = response.data

      setSubmissions(prev =>
        prev.map(submission =>
          submission._id === submissionId ? updated : submission
        )
      )

      return updated
    } catch (e) {
      throw new Error(
        e.response?.data?.message ??
        e.message ??
        'Failed to assign submission'
      )
    }
  }, [])

  const updateSubmission = useCallback(async (submissionId, data) => {
    try {
      const response = await submissionsAPI.update(submissionId, data)
      const updated = response.data

      setSubmissions(prev =>
        prev.map(submission =>
          submission._id === submissionId ? updated : submission
        )
      )

      return updated
    } catch (e) {
      throw new Error(
        e.response?.data?.message ??
        e.message ??
        'Failed to update submission'
      )
    }
  }, [])

  return {
    submissions,
    loading,
    error,
    refetch: load,
    createSubmission,
    assignSubmission,
    updateSubmission,
  }
}

export function useMySubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true)
      setError(null)

      const response = await submissionsAPI.mine()
      setSubmissions(normalizeSubmissionList(response.data))
    } catch (e) {
      setError(
        e.response?.data?.message ??
        e.message ??
        'Failed to load your submissions'
      )
      if (!background) setSubmissions([])
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

  return {
    submissions,
    loading,
    error,
    refetch: load,
  }
}
