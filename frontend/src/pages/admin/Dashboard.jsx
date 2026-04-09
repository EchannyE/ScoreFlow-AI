import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useSubmissions } from '../../hooks/useSubmission.js'
import { useCampaigns } from '../../hooks/useCampaign.js'
import { useUsers } from '../../hooks/useUsers.js'
import StatCard from '../../components/ui/StatCard.jsx'
import Card from '../../components/ui/Card.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

const CHART = [
  { d: 'Apr 1', s: 89, sc: 52 },
  { d: 'Apr 2', s: 118, sc: 71 },
  { d: 'Apr 3', s: 142, sc: 96 },
  { d: 'Apr 4', s: 162, sc: 134 },
]

const getCampaignId = submission => {
  if (!submission?.campaignId) return ''
  return typeof submission.campaignId === 'object'
    ? String(submission.campaignId._id || '')
    : String(submission.campaignId)
}

const getAssignedEvaluatorId = submission => {
  if (!submission?.assignedEvaluatorId) return ''
  return typeof submission.assignedEvaluatorId === 'object'
    ? submission.assignedEvaluatorId._id || ''
    : submission.assignedEvaluatorId
}

const getAccessCount = submission => {
  const fieldLinks = [
    submission?.fields?.projectUrl,
    submission?.fields?.githubUrl,
    submission?.fields?.demoUrl,
    submission?.fields?.fileUrl,
  ].filter(Boolean)

  const files = (submission?.files || [])
    .map(file => file?.url)
    .filter(Boolean)

  return [...fieldLinks, ...files].length
}

export default function AdminDashboard() {
  const { submissions, loading: sl, assignSubmission } = useSubmissions()
  const { campaigns, loading: cl } = useCampaigns()
  const { users: evaluators, loading: ul } = useUsers({ role: 'evaluator' })

  const [assignmentDrafts, setAssignmentDrafts] = useState({})
  const [assigningId, setAssigningId] = useState('')
  const [assignmentError, setAssignmentError] = useState('')

  const submissionsByCampaign = useMemo(() => {
    return submissions.reduce((grouped, submission) => {
      const key = getCampaignId(submission)
      grouped[key] = [...(grouped[key] ?? []), submission]
      return grouped
    }, {})
  }, [submissions])

  if (sl || cl || ul) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner size={40} />
        <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest animate-pulse">
          Initializing Intelligence...
        </span>
      </div>
    )
  }

  const active = campaigns.filter(c => c.status === 'active').length
  const completed = submissions.filter(s => s.status === 'completed').length
  const flagged = submissions.filter(s => s.flagged).length

  const handleDraftChange = (submissionId, evaluatorId) => {
    setAssignmentDrafts(prev => ({ ...prev, [submissionId]: evaluatorId }))
  }

  const handleAssign = async submission => {
    const evaluatorId =
      assignmentDrafts[submission._id] ?? getAssignedEvaluatorId(submission) ?? ''

    if (!evaluatorId) {
      setAssignmentError('Select an evaluator before assigning a submission.')
      return
    }

    try {
      setAssignmentError('')
      setAssigningId(submission._id)

      const updated = await assignSubmission(submission._id, evaluatorId)

      setAssignmentDrafts(prev => ({
        ...prev,
        [submission._id]: getAssignedEvaluatorId(updated) || evaluatorId,
      }))
    } catch (error) {
      setAssignmentError(error.message || 'Failed to assign evaluator.')
    } finally {
      setAssigningId('')
    }
  }

  return (
    <div className="fade-up space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_#00D4AA]" />
          <span className="text-[10px] text-green font-bold uppercase tracking-[0.2em]">
            System Overview // 2026
          </span>
        </div>
        <h2 className="font-display font-bold text-3xl tracking-tight text-white">
          Dashboard
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Campaigns" value={active} color="#00D4AA" icon="◈" />
        <StatCard label="Total Submissions" value={submissions.length} color="#4FC3F7" icon="⬆" />
        <StatCard label="Completed" value={completed} color="#7B5EA7" icon="⚖" />
        <StatCard label="Flagged" value={flagged} color="#E05260" icon="⚠" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">
              Growth Velocity
            </span>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
                Submissions
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis
                  dataKey="d"
                  tick={{ fontSize: 9, fill: '#718096', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#718096', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: 10,
                    borderRadius: 12,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="s"
                  stroke="#00D4AA"
                  strokeWidth={3}
                  fill="url(#g1)"
                  name="Submitted"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">
              Campaign Progress
            </span>
            <Link
              to="/admin/campaigns"
              className="text-[10px] text-green font-bold uppercase tracking-widest hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-6 flex-1">
            {campaigns.slice(0, 4).map(c => (
              <div key={c._id} className="group cursor-default">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white tracking-tight group-hover:text-green transition-colors line-clamp-1">
                      {c.title}
                    </span>
                  </div>
                  <Badge type={c.status} className="scale-75 origin-right">
                    {c.status}
                  </Badge>
                </div>
                <ProgressBar
                  pct={c.completionPct ?? 0}
                  color={c.status === 'active' ? '#00D4AA' : '#334155'}
                  height={5}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em] mb-1">
              Campaign Assignment Board
            </div>
            <h3 className="font-display font-bold text-2xl tracking-tight text-white">
              Entries grouped by campaign
            </h3>
          </div>
          <Link
            to="/admin/submissions"
            className="text-[10px] text-green font-bold uppercase tracking-widest hover:underline px-3 py-1 bg-green/5 rounded-full border border-green/10 w-fit"
          >
            Full Audit Log →
          </Link>
        </div>

        {assignmentError && (
          <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {assignmentError}
          </div>
        )}

        <div className="space-y-5">
          {campaigns.map(campaign => {
            const entries = submissionsByCampaign[String(campaign._id)] ?? []
            const assignedCount = entries.filter(entry => !!getAssignedEvaluatorId(entry)).length
            const completedCount = entries.filter(entry => entry.status === 'completed').length

            return (
              <Card key={campaign._id} className="overflow-hidden !p-0 border-white/5 shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-display font-bold text-2xl tracking-tight text-white">
                          {campaign.title}
                        </h4>
                        <Badge type={campaign.status}>{campaign.status}</Badge>
                      </div>
                      <p className="text-sm text-text-3 max-w-3xl">
                        {campaign.description || 'No campaign description has been added yet.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 min-w-[280px]">
                      <div className="rounded-2xl border border-white/5 bg-bg-1/60 px-4 py-3">
                        <div className="text-[9px] text-text-3 font-bold uppercase tracking-widest mb-1">
                          Entries
                        </div>
                        <div className="text-xl font-mono font-bold text-white">{entries.length}</div>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-bg-1/60 px-4 py-3">
                        <div className="text-[9px] text-text-3 font-bold uppercase tracking-widest mb-1">
                          Assigned
                        </div>
                        <div className="text-xl font-mono font-bold text-white">{assignedCount}</div>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-bg-1/60 px-4 py-3">
                        <div className="text-[9px] text-text-3 font-bold uppercase tracking-widest mb-1">
                          Completed
                        </div>
                        <div className="text-xl font-mono font-bold text-white">{completedCount}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {entries.length === 0 ? (
                  <div className="px-6 py-12 text-center text-text-3 text-sm">
                    No submissions have been received for this campaign yet.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {entries.map(entry => {
                      const selectedEvaluatorId =
                        assignmentDrafts[entry._id] ?? getAssignedEvaluatorId(entry) ?? ''

                      const accessCount = getAccessCount(entry)

                      return (
                        <div
                          key={entry._id}
                          className="px-6 py-5 flex flex-col 2xl:flex-row 2xl:items-center gap-5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <div className="text-sm font-bold text-white truncate">
                                {entry.title}
                              </div>
                              <Badge type={entry.status}>
                                {entry.status?.replace('_', ' ')}
                              </Badge>
                              {entry.flagged && <Badge type="flagged">Flagged</Badge>}
                              {entry.ai?.priority && (
                                <Badge type={entry.ai.priority}>{entry.ai.priority}</Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-3">
                              <span className="font-semibold text-text-2">{entry.track}</span>
                              <span>Submitter: {entry.submitterId?.name ?? 'Anonymous'}</span>
                              <span>AI baseline: {entry.ai?.suggestedScore ?? '—'}</span>
                              <span>Received: {new Date(entry.createdAt).toLocaleDateString()}</span>
                              <span className={accessCount > 0 ? 'text-green' : 'text-red'}>
                                {accessCount > 0
                                  ? `Access links: ${accessCount}`
                                  : 'No project access links'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-3 2xl:min-w-[460px]">
                            <select
                              value={selectedEvaluatorId}
                              onChange={event => handleDraftChange(entry._id, event.target.value)}
                              disabled={entry.status === 'completed'}
                              className="w-full md:min-w-[230px] bg-bg-3/50 border border-white/5 rounded-[12px] text-text-1 text-sm px-4 py-3 hover:border-white/10 focus:bg-bg-3 focus:ring-2 focus:ring-green/20 focus:border-green outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">Select evaluator</option>
                              {evaluators.map(evaluator => (
                                <option key={evaluator._id} value={evaluator._id}>
                                  {evaluator.name}
                                  {evaluator.expertise?.length
                                    ? ` • ${evaluator.expertise.join(', ')}`
                                    : ''}
                                </option>
                              ))}
                            </select>

                            <Button
                              onClick={() => handleAssign(entry)}
                              disabled={
                                entry.status === 'completed' ||
                                !selectedEvaluatorId ||
                                assigningId === entry._id
                              }
                              className="md:min-w-[150px]"
                            >
                              {assigningId === entry._id
                                ? 'Assigning...'
                                : getAssignedEvaluatorId(entry)
                                  ? 'Reassign Entry'
                                  : 'Assign Entry'}
                            </Button>
                          </div>

                          <div className="text-[11px] text-text-3 2xl:min-w-[180px]">
                            <div className="uppercase tracking-widest text-[9px] font-bold mb-1">
                              Assigned evaluator
                            </div>
                            <div className="text-text-1 font-semibold">
                              {entry.assignedEvaluatorId?.name ?? 'Unassigned'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
    }
