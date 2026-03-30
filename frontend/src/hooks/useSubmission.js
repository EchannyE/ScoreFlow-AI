import { useState, useEffect, useCallback, useMemo } from 'react'
import { submissionsAPI } from '../lib/api.jsx'
 
export function useSubmissions(params = {}) {
  const paramsKey = JSON.stringify(params)
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
 
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await submissionsAPI.list(stableParams)
      setSubmissions(data.submissions ?? data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [stableParams])
 
  useEffect(() => { load() }, [load])
 
  const createSubmission = async data => {
    const { data: created } = await submissionsAPI.create(data)
    setSubmissions(prev => [created, ...prev])
    return created
  }

  const assignSubmission = async (submissionId, evaluatorId) => {
    const { data: updated } = await submissionsAPI.assign(submissionId, evaluatorId)
    setSubmissions(prev => prev.map(submission => (
      submission._id === submissionId ? updated : submission
    )))
    return updated
  }
 
  return { submissions, loading, error, refetch: load, createSubmission, assignSubmission }
}
 
export function useMySubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
 
  useEffect(() => {
    submissionsAPI.mine()
      .then(({ data }) => setSubmissions(data))
      .finally(() => setLoading(false))
  }, [])
 
  return { submissions, loading }
}

 