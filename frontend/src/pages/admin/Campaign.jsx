import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCampaigns } from '../../hooks/useCampaign.js'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'draft',
  tracks: '',
  deadline: '',
  color: '#00D4AA',
}

export default function AdminCampaigns() {
  const {
    campaigns,
    loading,
    creating,
    updating,
    error: apiError,
    createCampaign,
    updateCampaign,
  } = useCampaigns()

  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const resetComposer = () => {
    setForm(INITIAL_FORM)
    setFormError('')
    setEditingId('')
    setIsComposerOpen(false)
  }

  const openCreateComposer = () => {
    setForm(INITIAL_FORM)
    setFormError('')
    setEditingId('')
    setIsComposerOpen(true)
  }

  const openEditComposer = campaign => {
    setForm({
      title: campaign.title ?? '',
      description: campaign.description ?? '',
      status: campaign.status ?? 'draft',
      tracks: Array.isArray(campaign.tracks) ? campaign.tracks.join(', ') : '',
      deadline: campaign.deadline ? String(campaign.deadline).slice(0, 10) : '',
      color: campaign.color ?? '#00D4AA',
    })
    setFormError('')
    setEditingId(campaign._id)
    setIsComposerOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validateForm = () => {
    if (!form.title.trim()) return 'Campaign title is required'
    if (!form.deadline) return 'Campaign deadline is required'
    if (!form.tracks.trim()) return 'Add at least one campaign track'
    return null
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const validationError = validateForm()
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
        .map(track => track.trim())
        .filter(Boolean),
    }

    try {
      setFormError('')

      if (editingId) {
        await updateCampaign(editingId, payload)
      } else {
        await createCampaign(payload)
      }

      resetComposer()
    } catch (e) {
      setFormError(e.message ?? 'Unable to save campaign')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner size={40} />
        <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest animate-pulse">
          Synchronizing Campaigns...
        </span>
      </div>
    )
  }

  return (
    <div className="fade-up space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_#00D4AA]" />
            <span className="text-[10px] text-green font-bold uppercase tracking-[0.2em]">
              Administrative Console
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight text-white">
            Active Campaigns
          </h2>
        </div>

        <Button
          onClick={() => {
            if (isComposerOpen && !editingId) {
              resetComposer()
            } else {
              openCreateComposer()
            }
          }}
          className="shadow-lg shadow-green/10 px-6"
        >
          <span className="mr-2 text-lg">+</span>
          {isComposerOpen && !editingId ? 'Close Composer' : 'New Campaign'}
        </Button>
      </div>

      {isComposerOpen && (
        <Card className="border-green/20 bg-bg-2/80 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <div className="text-[10px] text-green font-bold uppercase tracking-[0.2em] mb-2">
                  {editingId ? 'Campaign Editor' : 'Campaign Composer'}
                </div>
                <h3 className="font-display font-bold text-2xl tracking-tight text-white">
                  {editingId ? 'Update campaign configuration' : 'Launch a new evaluation cycle'}
                </h3>
                <p className="text-sm text-text-3 mt-2 max-w-2xl">
                  {editingId
                    ? 'Edit campaign metadata, deadline, tracks, and visibility state.'
                    : 'Create the campaign shell here, then assign evaluators and tune the rubric from the campaign management flow.'}
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={resetComposer} disabled={creating || updating}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || updating}
                  className="min-w-[180px] justify-center"
                >
                  {editingId
                    ? (updating ? 'Saving Changes...' : 'Save Changes →')
                    : (creating ? 'Creating Campaign...' : 'Create Campaign →')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Input
                label="Campaign Title"
                value={form.title}
                onChange={value => setField('title', value)}
                placeholder="e.g. Spring AI Innovation Challenge"
                required
              />

              <Input
                label="Deadline"
                type="date"
                value={form.deadline}
                onChange={value => setField('deadline', value)}
                required
              />

              <Input
                as="select"
                label="Status"
                value={form.status}
                onChange={value => setField('status', value)}
                options={[
                  { value: 'draft', label: 'Draft — hidden from submitters' },
                  { value: 'active', label: 'Active — accepting submissions' },
                  { value: 'closed', label: 'Closed — review only' },
                ]}
              />

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] text-text-3 tracking-[0.08em] uppercase font-bold">
                    Accent Color
                  </label>
                </div>
                <div className="flex items-center gap-3 rounded-[12px] border border-white/5 bg-bg-3/50 px-4 py-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={event => setField('color', event.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                  <div>
                    <div className="text-sm font-mono font-bold text-white">{form.color}</div>
                    <div className="text-[10px] text-text-3 font-bold uppercase tracking-wider">
                      Used in campaign cards and progress accents
                    </div>
                  </div>
                </div>
              </div>

              <Input
                className="xl:col-span-2"
                label="Tracks"
                value={form.tracks}
                onChange={value => setField('tracks', value)}
                placeholder="AI/ML, HealthTech, Climate, Web3"
                required
              />

              <Input
                className="xl:col-span-2"
                as="textarea"
                label="Description"
                value={form.description}
                onChange={value => setField('description', value)}
                placeholder="Summarize the campaign goals, eligibility, and judging context."
                rows={5}
              />
            </div>

            {(formError || apiError) && (
              <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {formError || apiError}
              </div>
            )}
          </form>
        </Card>
      )}

      {!campaigns.length && !isComposerOpen && (
        <Card className="border-dashed border-white/10 bg-bg-2/30">
          <div className="flex flex-col items-start gap-4">
            <div>
              <div className="text-[10px] text-green font-bold uppercase tracking-[0.2em] mb-2">
                No Campaigns Yet
              </div>
              <h3 className="font-display font-bold text-2xl text-white">
                Create the first campaign
              </h3>
              <p className="text-sm text-text-3 mt-2 max-w-xl">
                Start with a draft campaign, then add evaluators, rubric settings, and submission rules once the campaign shell exists.
              </p>
            </div>
            <Button onClick={openCreateComposer}>
              <span className="mr-2 text-lg">+</span> Open Campaign Composer
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {campaigns.map(c => {
          const themeColor = c.color ?? '#00D4AA'

          return (
            <Card key={c._id} hover accent={themeColor} className="group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xl tracking-tight text-white group-hover:text-green transition-colors">
                      {c.title}
                    </h3>
                    <Badge type={c.status}>{c.status}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(c.tracks ?? []).map(t => (
                      <span
                        key={t}
                        className="text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 text-text-3 group-hover:border-white/10 transition-colors"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="font-display font-black text-4xl tracking-tighter leading-none"
                    style={{ color: themeColor, filter: `drop-shadow(0 0 10px ${themeColor}33)` }}
                  >
                    {c.completionPct ?? 0}
                    <span className="text-sm ml-0.5 opacity-60">%</span>
                  </div>
                  <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest mt-1">
                    Evaluated
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ProgressBar pct={c.completionPct ?? 0} color={themeColor} height={6} />

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-3 font-bold uppercase tracking-wider">
                        Entries
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {String(c.submissionsCount ?? 0).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-3 font-bold uppercase tracking-wider">
                        Judges
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {String(c.evaluatorsCount ?? 0).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-text-3 font-bold uppercase tracking-wider block">
                      Deadline
                    </span>
                    <span className="text-xs font-bold text-orange/90 flex items-center gap-1.5 justify-end">
                      <span className="w-1 h-1 rounded-full bg-orange animate-pulse" />
                      {c.deadline?.slice(0, 10)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditComposer(c)}
                >
                  Edit
                </Button>

                <Link to={`/admin/campaigns/${c._id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white"
                  >
                    Manage Campaign →
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
