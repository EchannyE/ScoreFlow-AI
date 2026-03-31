import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampaigns } from '../../hooks/useCampaign.js'
import { useSubmissions } from '../../hooks/useSubmission.js'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [
  ['Confirmation email', 'Sent immediately after submission.'],
  ['AI enrichment (60s)', 'Summary + suggested score generated.'],
  ['Assigned to judges', 'Auto-routed within 24 hours.'],
  ['Score notification', 'Emailed when evaluation is complete.'],
]

const normalizeTracks = (tracks) => {
  if (Array.isArray(tracks)) {
    return tracks.map(t => String(t).trim()).filter(Boolean);
  }
  if (typeof tracks === 'string') {
    return tracks.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

function ErrorMsg({ children }) {
  return (
    <span className="text-[11px] text-red flex items-center gap-1">
      ⚠ {children}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function NewSubmission() {
  const navigate = useNavigate()
  const { campaigns, loading } = useCampaigns({ status: 'active' })
  const { createSubmission } = useSubmissions()

  const [form, setForm] = useState({
    title: '',
    campaignId: '',
    track: '',
    description: '',
    githubUrl: '',
    demoUrl: ''
  })

  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const normalizedCampaigns = useMemo(() => {
    return (campaigns ?? []).map(c => ({
      ...c,
      tracks: normalizeTracks(c.tracks)
    }))
  }, [campaigns])

  const campaign = normalizedCampaigns.find(c => c._id === form.campaignId)
  const trackOptions = (campaign?.tracks ?? []).map(t => ({ value: t, label: t }))

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleCampaignChange = (campaignId) => {
    const next = normalizedCampaigns.find(c => c._id === campaignId)
    setForm(p => ({
      ...p,
      campaignId,
      track: next?.tracks?.[0] ?? ''
    }))
    setErrors(p => ({ ...p, campaign: '', track: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title) e.title = 'Required'
    if (!form.campaignId) e.campaign = 'Required'
    if (!form.track) e.track = 'Required'
    if (!form.description) e.desc = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handle = async () => {
    if (!validate()) return
    setSaving(true)

    try {
      await createSubmission({
        ...form,
        fields: { description: form.description }
      })
      setDone(true)
    } catch (e) {
      setErrors({
        submit: e.response?.data?.message ?? 'Submission failed. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner />
      </div>
    )
  }

  if (done) {
    return (
      <div className="fade-up flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12">
        <div className="w-16 h-16 rounded-full bg-green/10 border border-green/25 flex items-center justify-center text-3xl mb-5">
          ✓
        </div>
        <h3 className="font-display font-bold text-2xl text-green mb-2">
          Submission Received
        </h3>
        <p className="text-sm text-text-2 mb-2 max-w-xs leading-relaxed">
          Your entry is in. AI enrichment runs within 60 seconds.
        </p>
        <Button onClick={() => navigate('/submitter')}>
          View My Submissions →
        </Button>
      </div>
    )
  }

  return (
    <div className="fade-up max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/submitter')}
        className="flex items-center gap-1.5 text-text-2 text-xs font-mono mb-6 hover:text-text-1 transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        ‹ Back
      </button>

      <div className="mb-6">
        <div className="text-[11px] text-green uppercase tracking-[0.18em] mb-1.5">
          // submitter
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-[26px] tracking-tight">
          New Submission
        </h2>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label="Project Title"
              value={form.title}
              onChange={v => set('title', v)}
              placeholder="e.g. AquaMonitor — Ocean Health AI"
              required
            />
            {errors.title && <ErrorMsg>{errors.title}</ErrorMsg>}

            <Input
              as="select"
              label="Campaign"
              value={form.campaignId}
              onChange={handleCampaignChange}
              options={[
                { value: '', label: 'Select a campaign' },
                ...normalizedCampaigns.map(c => ({ value: c._id, label: c.title })),
              ]}
              required
            />
            {errors.campaign && <ErrorMsg>{errors.campaign}</ErrorMsg>}

            <Input
              as="select"
              label="Track"
              value={form.track}
              onChange={v => set('track', v)}
              options={[
                { value: '', label: campaign ? 'Select a track' : 'Select a campaign first' },
                ...trackOptions,
              ]}
              disabled={!campaign || !trackOptions.length}
              required
            />
            {errors.track && <ErrorMsg>{errors.track}</ErrorMsg>}

            <Input
              as="textarea"
              label="Project Description"
              value={form.description}
              onChange={v => set('description', v)}
              rows={5}
              required
            />
            {errors.desc && <ErrorMsg>{errors.desc}</ErrorMsg>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Project / Repo URL"
                value={form.githubUrl}
                onChange={v => set('githubUrl', v)}
              />
              <Input
                label="Demo URL (optional)"
                value={form.demoUrl}
                onChange={v => set('demoUrl', v)}
              />
            </div>

            {errors.submit && (
              <div className="text-[11px] text-red bg-red/8 border border-red/20 rounded-lg px-3 py-2">
                {errors.submit}
              </div>
            )}

            <Button onClick={handle} disabled={saving} className="w-full mt-1">
              {saving ? 'Submitting…' : 'Submit Entry ✓'}
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card className="!border-green/15 bg-green/[0.02]">
            <div className="text-[11px] text-green uppercase tracking-widest mb-3.5 font-semibold">
              What happens next
            </div>
            {STEPS.map(([t, d], i) => (
              <div key={i} className="flex gap-3 mb-3 last:mb-0">
                <div className="w-5 h-5 rounded-full bg-green/10 border border-green/25 flex items-center justify-center text-[10px] text-green mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs font-medium mb-0.5">{t}</div>
                  <div className="text-[11px] text-text-3">{d}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
