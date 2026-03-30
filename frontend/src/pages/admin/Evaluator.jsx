import React, { useMemo } from 'react'
import { useUsers } from '../../hooks/useUsers.js'
import { useSubmissions } from '../../hooks/useSubmission.js'
import Card        from '../../components/ui/Card.jsx'
import Badge       from '../../components/ui/Badge.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Spinner     from '../../components/ui/Spinner.jsx'

export default function AdminEvaluators() {
  const { users: evaluators, loading: usersLoading, error } = useUsers({ role: 'evaluator' })
  const { submissions, loading: submissionsLoading } = useSubmissions()

  const evaluatorCards = useMemo(() => evaluators.map(evaluator => {
    const assignedSubmissions = submissions.filter(submission => {
      const assignedId = submission.assignedEvaluatorId?._id ?? submission.assignedEvaluatorId
      return String(assignedId ?? '') === String(evaluator._id)
    })
    const completed = assignedSubmissions.filter(submission => submission.status === 'scored').length
    const pending = assignedSubmissions.filter(submission => submission.status !== 'scored').length
    const pct = assignedSubmissions.length
      ? Math.round((completed / assignedSubmissions.length) * 100)
      : 0

    return {
      ...evaluator,
      assigned: assignedSubmissions.length,
      completed,
      pending,
      pct,
      statusType: evaluator.isActive ? 'active' : 'warning',
      statusLabel: evaluator.isActive ? 'active' : 'inactive',
    }
  }), [evaluators, submissions])

  if (usersLoading || submissionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner size={40} />
        <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest animate-pulse">
          Syncing evaluator registry...
        </span>
      </div>
    )
  }

  return (
    <div className="fade-up space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_#00D4AA]" />
            <span className="text-[10px] text-green font-bold uppercase tracking-[0.2em]">
              Personnel Audit // Internal
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight text-white">Evaluators</h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest block mb-1">Active Pool</span>
          <span className="text-xl font-mono font-bold text-white">{evaluatorCards.length}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {evaluatorCards.length === 0 && (
          <Card>
            <div className="py-10 text-center text-sm text-text-3">
              No evaluator accounts are registered yet.
            </div>
          </Card>
        )}

        {evaluatorCards.map(e => {
          const bCol  = e.pct === 100 ? '#00D4AA' : e.pct > 50 ? '#F5A623' : '#E05260'
          
          return (
            <Card key={e._id} hover className="!p-0 overflow-hidden group">
              <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr_1.1fr] items-center">
                
                {/* Identity & Domain */}
                <div className="p-5 flex items-center gap-4 border-r border-white/5">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple/20 to-blue/20 
                                  border border-white/10 flex items-center justify-center 
                                  text-xs font-bold text-white flex-shrink-0 shadow-inner">
                      {e.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-bg-2 
                                    ${e.isActive ? 'bg-green' : 'bg-orange'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate group-hover:text-green transition-colors">{e.name}</div>
                    <div className="text-[11px] text-text-3 truncate mt-1">{e.email}</div>
                    <div className="flex gap-1 mt-1.5 overflow-hidden flex-wrap">
                      {(e.expertise?.length ? e.expertise : ['General']).map(x => (
                        <span key={x} className="text-[8px] font-bold uppercase tracking-tighter text-text-3 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5">
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scored Metric */}
                <div className="p-5 text-center border-r border-white/5 bg-white/[0.01]">
                  <div className="text-[10px] text-text-3 font-bold uppercase tracking-widest mb-1">Assigned</div>
                  <div className="font-mono font-bold text-lg text-white">
                    {e.assigned}
                  </div>
                </div>

                {/* Completed Metric */}
                <div className="p-5 text-center border-r border-white/5">
                  <div className="text-[10px] text-text-3 font-bold uppercase tracking-widest mb-1">Scored</div>
                  <div className="font-mono font-bold text-lg text-green" style={{ textShadow: '0 0 10px #00D4AA33' }}>
                    {e.completed}
                  </div>
                </div>

                {/* Pending Metric */}
                <div className="p-5 text-center border-r border-white/5 bg-white/[0.01]">
                  <div className="text-[10px] text-text-3 font-bold uppercase tracking-widest mb-1">Pending</div>
                  <div className="text-sm font-mono font-bold text-text-2">{e.pending}</div>
                </div>

                {/* Status & Progress */}
                <div className="p-5 flex flex-col gap-3 items-end bg-gradient-to-l from-white/[0.02] to-transparent">
                  <Badge type={e.statusType} className="scale-90 origin-right">{e.statusLabel}</Badge>
                  <div className="w-full max-w-[120px] space-y-1">
                    <div className="flex justify-between text-[9px] font-mono font-bold text-text-3 px-0.5">
                      <span>PROGRESS</span>
                      <span style={{ color: bCol }}>{e.pct}%</span>
                    </div>
                    <ProgressBar pct={e.pct} color={bCol} height={4} />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Footer Info */}
      <p className="text-center text-[10px] text-text-3/40 uppercase tracking-[0.2em] font-bold">
        Performance data updated in real-time • ScoreFlow AI Personnel
      </p>
    </div>
  )
}