
 import { useState, useEffect, useCallback, useMemo } from 'react'
import { campaignsAPI } from '../lib/api.jsx'

const EMPTY_PARAMS = {}

function normalizeCampaignList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.campaigns)) return payload.campaigns
  return []
}

export function useCampaigns(params = EMPTY_PARAMS) {
  const paramsKey = JSON.stringify(params ?? EMPTY_PARAMS)
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey])

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async activeParams => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await campaignsAPI.list(activeParams)
      setCampaigns(normalizeCampaignList(data))
    } catch (e) {
      setError(
        e.response?.data?.message ??
        e.message ??
        'Failed to load campaigns'
      )
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createCampaign = useCallback(async payload => {
    try {
      setCreating(true)
      setError(null)

      const response = await campaignsAPI.create(payload)
      await load(stableParams)
      return response.data
    } catch (e) {
      const message =
        e.response?.data?.message ??
        e.message ??
        'Failed to create campaign'

      setError(message)
      throw Object.assign(e, { message })
    } finally {
      setCreating(false)
    }
  }, [load, stableParams])

  const updateCampaign = useCallback(async (campaignId, payload) => {
    try {
      setUpdating(true)
      setError(null)

      const response = await campaignsAPI.update(campaignId, payload)
      await load(stableParams)
      return response.data
    } catch (e) {
      const message =
        e.response?.data?.message ??
        e.message ??
        'Failed to update campaign'

      setError(message)
      throw Object.assign(e, { message })
    } finally {
      setUpdating(false)
    }
  }, [load, stableParams])

  useEffect(() => {
    load(stableParams)
  }, [load, stableParams])

  return {
    campaigns,
    loading,
    creating,
    updating,
    error,
    refetch: () => load(stableParams),
    createCampaign,
    updateCampaign,
  }
}
