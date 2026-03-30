import React, { useState } from 'react'
import { useNavigate }    from 'react-router-dom'
import { useCampaigns }   from '../../hooks/useCampaign.js'
import { useSubmissions } from '../../hooks/useSubmission.js'
import Card    from '../../components/ui/Card.jsx'
import Input   from '../../components/ui/Input.jsx'
import Button  from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
 
const STEPS = [
  ['Confirmation email', 'Sent immediately after submission.'],
  ['AI enrichment (60s)', 'Summary + suggested score generated.'],
  ['Assigned to judges',  'Auto-routed within 24 hours.'],
  ['Score notification',  'Emailed when evaluation is complete.'],
]

const normalizeTracks = tracks => {
  if (Array.isArray(tracks)) {
    return tracks.map(track => String(track).trim()).filter(Boolean)
  }

  if (typeof tracks === 'string') {
    return tracks.split(',').map(track => track.trim()).filter(Boolean)
  }

  return []
}
 
export default function NewSubmission() {
  const navigate = useNavigate()
  const { campaigns, loading } = useCampaigns({ status: 'active' })
  const { createSubmission }   = useSubmissions()
 
  const [form, setForm]     = useState({ title: '', campaignId: '', track: '', description: '', githubUrl: '', demoUrl: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone]     = useState(false)
  const [saving, setSaving] = useState(false)

  const normalizedCampaigns = campaigns.map(campaign => ({
    ...campaign,
    tracks: normalizeTracks(campaign.tracks),
  }))
 
  const campaign = normalizedCampaigns.find(c => c._id === form.campaignId)
  const trackOptions = (campaign?.tracks ?? []).map(track => ({ value: track, label: track }))
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleCampaignChange = campaignId => {
    const nextCampaign = normalizedCampaigns.find(c => c._id === campaignId)
    const nextTrack = nextCampaign?.tracks?.[0] ?? ''

    setForm(prev => ({
      ...prev,
      campaignId,
      track: nextTrack,
    }))

    setErrors(prev => ({
      ...prev,
      campaign: campaignId ? '' : prev.campaign,
      track: nextTrack ? '' : prev.track,
    }))
  }
 
  const validate = () => {
    const e = {}
    if (!form.title)       e.title = 'Required'
    if (!form.campaignId)  e.campaign = 'Required'
    if (!form.track)       e.track = 'Required'
    if (!form.description) e.desc = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }
 
  const handle = async () => {
    if (!validate()) return
    setSaving(true)
    await createSubmission({ ...form, fields: { description: form.description } })
    setDone(true); setSaving(false)
  }
 
  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>
 
  if (done) return (
    <div className="fade-up text-center py-16 px-6">
      <div className="text-5xl mb-4">✓</div>
      <h3 className="font-display font-bold text-2xl text-green mb-2">
        Submission Received
      </h3>
      <p className="text-[13px] text-text-2 mb-6">
        AI enrichment will run within 60 seconds.
      </p>
      <Button onClick={() => navigate('/submitter')}>View My Submissions →</Button>
    </div>
  )
 
  return (
    <div className="fade-up">
      <button onClick={() => navigate('/submitter')}
        className="bg-transparent border-none text-text-2 text-xs cursor-pointer
                   font-mono mb-6 hover:text-text-1 transition-colors">
        ‹ Back
      </button>
 
      <div className="mb-6">
        <div className="text-[11px] text-green uppercase tracking-[0.18em] mb-1.5">
          // submitter
        </div>
        <h2 className="font-display font-bold text-[26px] tracking-tight">
          New Submission
        </h2>
      </div>
 
      <div className="grid grid-cols-[1.5fr_1fr] gap-5">
        <Card>
          <div className="flex flex-col gap-4">
            <Input label="Project Title" value={form.title} onChange={v => set('title', v)}
              placeholder="e.g. AquaMonitor — Ocean Health AI" required />
            {errors.title && <span className="text-[11px] text-red">{errors.title}</span>}
 
            <Input as="select" label="Campaign" value={form.campaignId}
              onChange={handleCampaignChange}
              options={normalizedCampaigns.map(c => ({ value: c._id, label: c.title }))}
              placeholder="Select a campaign"
              required />
            {errors.campaign && <span className="text-[11px] text-red">{errors.campaign}</span>}
 
            <Input as="select" label="Track" value={form.track}
              onChange={v => set('track', v)}
              options={trackOptions}
              placeholder={campaign ? 'Select a track' : 'Select a campaign first'}
              disabled={!campaign || !trackOptions.length}
              required />
            {errors.track && <span className="text-[11px] text-red">{errors.track}</span>}
 
            <Input as="textarea" label="Project Description" value={form.description}
              onChange={v => set('description', v)}
              placeholder="Describe your project and its impact…" rows={5} required />
            {errors.desc && <span className="text-[11px] text-red">{errors.desc}</span>}
 
            <Input label="GitHub / Repo URL" value={form.githubUrl}
              onChange={v => set('githubUrl', v)} placeholder="https://github.com/…" />
            <Input label="Demo URL (optional)" value={form.demoUrl}
              onChange={v => set('demoUrl', v)} placeholder="https://…" />
 
            <Button onClick={handle} disabled={saving} className="mt-1">
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
              <div key={i} className="flex gap-3 mb-3.5">
                <div className="w-5 h-5 rounded-full bg-green/10 border border-green/25
                                flex items-center justify-center text-[10px] text-green flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs mb-0.5">{t}</div>
                  <div className="text-[11px] text-text-3">{d}</div>
                </div>
              </div>
            ))}
          </Card>
 
          {campaign && (
            <Card>
              <div className="text-[11px] text-text-3 uppercase tracking-widest mb-2.5">
                Campaign
              </div>
              <div className="font-display font-bold text-[15px] mb-2">{campaign.title}</div>
              <div className="text-[11px] text-text-3 mb-2">
                📅 Deadline:{' '}
                <span className="text-orange">{campaign.deadline?.slice(0, 10)}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {campaign.tracks?.map(t => (
                  <span key={t}
                    className="text-[10px] bg-bg-3 border border-border rounded px-2 py-0.5 text-text-2">
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}