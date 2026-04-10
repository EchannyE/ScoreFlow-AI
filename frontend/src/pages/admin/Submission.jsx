import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubmissions } from '../../hooks/useSubmission.js'
import { useUsers } from '../../hooks/useUsers.js'
import Badge from '../../components/ui/Badge.jsx'
import ScoreRing from '../../components/ui/ScoreRing.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

const FILTERS = ['all', 'submitted', 'under_review', 'completed', 'flagged']

export default function AdminSubmissions() {
  const { submissions, loading, assignSubmission } = useSubmissions()
  const { users: evaluators, loading: evaluatorsLoading } = useUsers({ role: 'evaluator' })
  const [filter, setFilter] = useState('all')
  const [assignmentDrafts, setAssignmentDrafts] = useState({})
  const [assigningId, setAssigningId] = useState('')
  const [assignmentError, setAssignmentError] = useState('')
  const navigate = useNavigate()

  if (loading || evaluatorsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner size={40} />
        <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest animate-pulse">
          Fetching Audit Logs...
        </span>
      </div>
    )
  }

  const handleDraftChange = (submissionId, evaluatorId) => {
    setAssignmentDrafts(prev => ({ ...prev, [submissionId]: evaluatorId }))
  }

  const handleAssign = async submission => {
    const evaluatorId =
      assignmentDrafts[submission._id] ??
      submission.assignedEvaluatorId?._id ??
      ''

    if (!evaluatorId) {
      setAssignmentError('Select an evaluator before assigning a project.')
      return
    }

    try {
      setAssigningId(submission._id)
      setAssignmentError('')
      const updated = await assignSubmission(submission._id, evaluatorId)

      setAssignmentDrafts(prev => ({
        ...prev,
        [submission._id]: updated.assignedEvaluatorId?._id ?? evaluatorId,
      }))
    } catch (error) {
      setAssignmentError(error.message)
    } finally {
      setAssigningId('')
    }
  }

  const list =
    filter === 'all'
      ? submissions
      : filter === 'flagged'
        ? submissions.filter(s => s.flagged || s.ai?.qualityFlag)
        : submissions.filter(s => s.status === filter)

  return (
    <div className="fade-up space-y-8">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_#00D4AA]" />
            <span className="text-[10px] text-green font-bold uppercase tracking-[0.2em]">
              Master Submission Log
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight text-white">
            Submissions
          </h2>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest block mb-1">
            Total Entries
          </span>
          <span className="text-xl font-mono font-bold text-white">{list.length}</span>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-bg-1 border border-white/5 rounded-2xl w-fit">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] px-5 py-2 rounded-xl cursor-pointer font-bold
              uppercase tracking-widest transition-all duration-200
              ${
                filter === f
                  ? 'bg-green text-bg-0 shadow-lg shadow-green/10 scale-105'
                  : 'text-text-3 hover:text-white hover:bg-white/5'
              }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {assignmentError && (
        <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red-400">
          {assignmentError}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {list.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-40">
            <span className="text-xs font-bold uppercase tracking-widest text-text-3">
              No matching entries found
            </span>
          </div>
        ) : (
          list.map(s => {
            const selectedEvaluatorId =
              assignmentDrafts[s._id] ?? s.assignedEvaluatorId?._id ?? ''

            const isCompleted = s.status === 'completed'
            const displayScore = s.finalScore ?? s.ai?.suggestedScore ?? 0
            const ringColor = s.finalScore != null ? '#00D4AA' : '#A855F7'

            return (
              <Card
                key={s._id}
                hover
                onClick={() => navigate(`/admin/submissions/${s._id}`)}
                className={`!p-4 group relative ${s.flagged || s.ai?.qualityFlag ? 'border-red/40 bg-red/5' : ''}`}
              >
                {(s.flagged || s.ai?.qualityFlag) && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-red shadow-[4px_0_12px_rgba(224,82,96,0.3)]" />
                )}

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 blur-lg bg-purple/10 rounded-full" />
                    <ScoreRing
                      score={displayScore}
                      size={52}
                      color={ringColor}
                      strokeWidth={5}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-1.5 truncate group-hover:text-green transition-colors">
                      {s.title}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-text-3 font-medium uppercase tracking-wider flex-wrap">
                      <span className="text-text-2 font-bold">
                        {s.submitterId?.name ?? 'Anonymous'}
                      </span>
                      <span className="opacity-30">•</span>
                      <span>{s.track}</span>
                      <span className="opacity-30">•</span>
                      <span className="font-mono">
                        {new Date(s.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-text-3 font-medium uppercase tracking-wider flex flex-wrap gap-3">
                      <span>
                        {s.assignedEvaluatorId?.name
                          ? `Assigned to ${s.assignedEvaluatorId.name}`
                          : 'Unassigned'}
                      </span>

                      {isCompleted && s.finalScore != null && (
                        <span className="text-green">
                          Final Score: {s.finalScore}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 xl:ml-auto">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex gap-2 flex-wrap justify-end">
                        {(s.flagged || s.ai?.qualityFlag) && (
                          <Badge type="flagged">Violation Flag</Badge>
                        )}
                        <Badge type={s.status}>{s.status?.replace('_', ' ')}</Badge>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-3 group-hover:bg-green/10 group-hover:text-green transition-all">
                      <span className="text-lg leading-none mt-[-2px]">›</span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 border-t border-white/5 pt-4 flex flex-col gap-3 xl:flex-row xl:items-end"
                  onClick={event => event.stopPropagation()}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-text-3 font-bold uppercase tracking-widest mb-2">
                      Assign Project To Evaluator
                    </div>

                    <Input
                      as="select"
                      value={selectedEvaluatorId}
                      onChange={value => handleDraftChange(s._id, value)}
                      placeholder="Choose evaluator"
                      disabled={isCompleted || evaluators.length === 0}
                      options={evaluators.map(evaluator => ({
                        value: evaluator._id,
                        label: evaluator.expertise?.length
                          ? `${evaluator.name} • ${evaluator.expertise.join(', ')}`
                          : evaluator.name,
                      }))}
                    />
                  </div>

                  <div className="flex flex-col gap-2 xl:items-end xl:min-w-[220px]">
                    <Button
                      onClick={() => handleAssign(s)}
                      disabled={
                        isCompleted ||
                        !selectedEvaluatorId ||
                        assigningId === s._id ||
                        evaluators.length === 0
                      }
                      className="w-full xl:w-auto"
                    >
                      {assigningId === s._id
                        ? 'Assigning...'
                        : s.assignedEvaluatorId?._id
                          ? 'Reassign Project'
                          : 'Assign Project'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => navigate(`/admin/submissions/${s._id}`)}
                      className="text-[10px] font-bold uppercase tracking-widest text-text-3 hover:text-white transition-colors"
                    >
                      Open detail view
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <p className="pt-4 text-center text-[10px] text-text-3/40 uppercase tracking-[0.2em] font-bold">
        Secure Transaction Log • ISO Encrypted
      </p>
    </div>
  )
}
