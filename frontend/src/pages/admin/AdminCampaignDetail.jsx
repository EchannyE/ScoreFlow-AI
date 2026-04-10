import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { campaignsAPI } from '../../lib/api.jsx'
import { useCampaigns } from '../../hooks/useCampaign.js'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

export default function AdminCampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { updateCampaign, updating } = useCampaigns()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
    tracks: '',
    deadline: '',
    color: '#00D4AA',
  })

  const setField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }))

  // ============================
  // 📌 LOAD CAMPAIGN
  // ============================
  useEffect(() => {
    async function loadCampaign() {
      try {
        setLoading(true)
        setError('')

        const { data } = await campaignsAPI.get(id)
        const c = data

        setForm({
          title: c.title || '',
          description: c.description || '',
          status: c.status || 'draft',
          tracks: (c.tracks || []).join(', '),
          deadline: c.deadline?.slice(0, 10) || '',
          color: c.color || '#00D4AA',
        })
      } catch (e) {
        setError(
          e.response?.data?.message ??
          e.message ??
          'Failed to load campaign'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) loadCampaign()
  }, [id])

  // ============================
  // 📌 VALIDATION
  // ============================
  const validate = () => {
    if (!form.title.trim()) return 'Title is required'
    if (!form.deadline) return 'Deadline is required'
    if (!form.tracks.trim()) return 'At least one track is required'
    return null
  }

  // ============================
  // 📌 UPDATE HANDLER
  // ============================
  const handleUpdate = async e => {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      deadline: new Date(`${form.deadline}T23:59:59`).toISOString(),
      color: form.color,
      tracks: form.tracks
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    }

    try {
      setFormError('')
      await updateCampaign(id, payload)
      navigate('/admin/campaigns')
    } catch (e) {
      setFormError(e.message)
    }
  }

  // ============================
  // 📌 UI STATES
  // ============================
  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center pt-16 text-red">
        {error}
      </div>
    )
  }

  // ============================
  // 📌 UI
  // ============================
  return (
    <div className="fade-up space-y-6">
      <div>
        <div className="text-[11px] text-green uppercase tracking-[0.18em] mb-2">
          // admin
        </div>
        <h2 className="font-display font-bold text-3xl tracking-tight">
          Edit Campaign
        </h2>
      </div>

      <Card>
        <form onSubmit={handleUpdate} className="space-y-6">

          <Input
            label="Title"
            value={form.title}
            onChange={v => setField('title', v)}
          />

          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={v => setField('deadline', v)}
          />

          <Input
            as="select"
            label="Status"
            value={form.status}
            onChange={v => setField('status', v)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'closed', label: 'Closed' },
            ]}
          />

          <Input
            label="Tracks"
            value={form.tracks}
            onChange={v => setField('tracks', v)}
          />

          <Input
            as="textarea"
            label="Description"
            value={form.description}
            onChange={v => setField('description', v)}
          />

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={e => setField('color', e.target.value)}
            />
            <span className="text-sm">{form.color}</span>
          </div>

          {(formError) && (
            <div className="text-red text-sm">{formError}</div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Campaign'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/campaigns')}
            >
              Cancel
            </Button>
          </div>

        </form>
      </Card>
    </div>
  )
}
