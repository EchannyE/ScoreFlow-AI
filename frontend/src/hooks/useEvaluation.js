import { useState, useEffect, useCallback } from 'react'
import { evaluationsAPI } from '../lib/api.jsx'
 
export function useEvaluatorQueue() {
  const [queue, setQueue]     = useState([])
  const [loading, setLoading] = useState(true)
 
  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await evaluationsAPI.myQueue()
    setQueue(data)
    setLoading(false)
  }, [])
 
  useEffect(() => { load() }, [load])
 
  const submitScore = async data => {
    const { data: evaluation } = await evaluationsAPI.create(data)
    setQueue(prev => prev.filter(s => s._id !== data.submissionId))
    return evaluation
  }
 
  return { queue, loading, refetch: load, submitScore }
}
 