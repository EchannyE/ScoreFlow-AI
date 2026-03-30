import { useState, useEffect, useCallback, useMemo } from 'react'
import { usersAPI } from '../lib/api.jsx'

export function useUsers(params = {}) {
  const paramsKey = JSON.stringify(params)
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await usersAPI.list(stableParams)
      setUsers(data.users ?? data)
    } catch (e) {
      setError(e.response?.data?.message ?? e.message)
    } finally {
      setLoading(false)
    }
  }, [stableParams])

  useEffect(() => { load() }, [load])

  return { users, loading, error, refetch: load }
}