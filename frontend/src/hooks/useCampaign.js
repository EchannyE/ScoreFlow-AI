import { useState, useEffect, useCallback } from 'react'
import { campaignsAPI } from '../lib/api.jsx'
 
const EMPTY_PARAMS = {}

export function useCampaigns(params = EMPTY_PARAMS) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading]     = useState(true)
  const [creating, setCreating]   = useState(false)
  const [error, setError]         = useState(null)
  const paramsKey = JSON.stringify(params ?? EMPTY_PARAMS)
 
  const load = useCallback(async activeParams => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await campaignsAPI.list(activeParams)
      setCampaigns(data.campaigns ?? data)
    } catch (e) {
      setError(e.response?.data?.message ?? e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCampaign = useCallback(async payload => {
    try {
      setCreating(true)
      setError(null)
      const response = await campaignsAPI.create(payload)
      await load(params)
      return response.data
    } catch (e) {
      const message = e.response?.data?.message ?? e.message
      setError(message)
      throw Object.assign(e, { message })
    } finally {
      setCreating(false)
    }
  }, [load, paramsKey])
 
  useEffect(() => { load(params) }, [load, paramsKey])
 
  return {
    campaigns,
    loading,
    creating,
    error,
    refetch: () => load(params),
    createCampaign,
  }
}
 