import { useState, useEffect, useCallback, useMemo } from 'react'
import { submissionsAPI } from '../lib/api.jsx'

export function useSubmissions(params = {}) {
  const paramsKey = JSON.stringify(params)
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey])

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const normalizeListResponse = payload => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.submissions)) return payload.submissions
    return []
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await submissionsAPI.list(stableParams)
      setSubmissions(normalizeListResponse(response.data))
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [stableParams])

  useEffect(() => {
    load()
  }, [load])

  const createSubmission = async data => {
    try {
      const response = await submissionsAPI.create(data)
      const created = response.data

      setSubmissions(prev => [created, ...prev])
      return created
    } catch (e) {
      throw new Error(e.response?.data?.message ?? e.message ?? 'Failed to create submission')
    }
  }

  const assignSubmission = async (submissionId, evaluatorId) => {
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
      throw new Error(e.response?.data?.message ?? e.message ?? 'Failed to assign submission')
    }
  }

  const updateSubmission = async (submissionId, data) => {
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
      throw new Error(e.response?.data?.message ?? e.message ?? 'Failed to update submission')
    }
  }

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

  const normalizeMineResponse = payload => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.submissions)) return payload.submissions
    return []
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await submissionsAPI.mine()
      setSubmissions(normalizeMineResponse(response.data))
    } catch (e) {
      setError(e.response?.data?.message ?? e.message ?? 'Failed to load your submissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    submissions,
    loading,
    error,
    refetch: load,
  }
  }
