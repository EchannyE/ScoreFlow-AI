import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useEvaluatorQueue } from '../../hooks/useEvaluation.js'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ScoreRing from '../../components/ui/ScoreRing.jsx'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

function AccessIndicator({ submission }) {
  const accessCount = [
    submission.fields?.projectUrl,
    submission.fields?.githubUrl,
    submission.fields?.demoUrl,
    submission.fields?.fileUrl,
    ...(submission.files?.map(f => f?.url).filter(Boolean) || []),
  ].filter(Boolean).length

  const hasAccess = accessCount > 0

  return (
    <span className={`text-[10px] font-medium ${hasAccess ? 'text-green' : 'text-red'}`}>
      {hasAccess ? `Access ready (${accessCount})` : 'No project access link'}
    </span>
  )
}

export default function EvaluatorQueue() {
  const location = useLocation()
  const { queue, loading, error } = useEvaluatorQueue()
  const [dismissedSubmissionId, setDismissedSubmissionId] = useState('')
  const recentlyScored =
    location.state?.recentlyScored?.submissionId === dismissedSubmissionId
      ? null
      : location.state?.recentlyScored ?? null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner size={40} />
        <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest animate-pulse">
          Fetching assignments...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center !py-16">
        <div className="text-4xl mb-3">⚠</div>
        <div className="text-[15px] mb-2">Failed to load queue</div>
        <div className="text-xs text-text-3">{error}</div>
      </Card>
    )
  }

  return (
    <div className="fade-up space-y-8">
      {recentlyScored && (
        <Card className="border border-green/20 bg-green/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] text-green font-bold uppercase tracking-[0.2em] mb-2">
                Evaluation submitted
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {recentlyScored.title}
              </div>
              <div className="text-sm text-text-3">
                Final score: {recentlyScored.weightedScore}
                {recentlyScored.aiScore != null && (
                  <>
                    {' '}• AI {recentlyScored.aiScore}{' '}
                    ({recentlyScored.scoreDelta > 0 ? '+' : ''}
                    {recentlyScored.scoreDelta})
                  </>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                setDismissedSubmissionId(recentlyScored.submissionId)
              }
              className="w-full lg:w-auto"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-[10px] text-purple font-bold uppercase tracking-[0.2em]">
              Evaluation Stream // Queue
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight text-white">
            My Queue{' '}
            <span className="text-xl text-text-3 font-medium ml-2 opacity-50">
              ({queue.length})
            </span>
          </h2>
        </div>

        <div className="hidden md:block text-right">
          <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest block mb-1">
            Status
          </span>
          <Badge type="active">Online & Ready</Badge>
        </div>
      </div>

      {queue.length === 0 && (
        <Card className="flex flex-col items-center justify-center !py-20 bg-bg-2/30">
          <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center text-green text-3xl mb-6 shadow-inner">
            ✓
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Queue Clear</h3>
          <p className="text-sm text-text-3 text-center max-w-[280px] leading-relaxed">
            You've completed all pending evaluations. New entries will appear here as they are
            submitted.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {queue.map(s => {
          const aiScore = s.ai?.suggestedScore ?? 0

          return (
            <Card
              key={s._id}
              hover
              className={`group !p-6 relative overflow-hidden transition-all duration-300 ${
                s.flagged ? 'border-red/20' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 blur-xl bg-purple/10 rounded-full" />
                  <ScoreRing score={aiScore} size={60} color="#A855F7" strokeWidth={5} />
                  <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-bg-2 flex items-center justify-center border border-white/5">
                    <span className="text-[8px]">🧠</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="text-base font-bold text-white tracking-tight group-hover:text-green transition-colors truncate">
                      {s.title}
                    </h4>

                    {s.flagged && (
                      <Badge type="flagged" className="scale-90">
                        Attention Required
                      </Badge>
                    )}

                    {s.ai?.priority && (
                      <Badge type={s.ai.priority} className="scale-90">
                        {s.ai.priority}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-text-2 leading-relaxed mb-4 line-clamp-2 italic opacity-80">
                    {s.ai?.summary ||
                      s.fields?.description ||
                      'Entry data is being synchronized for evaluation...'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-3 font-bold uppercase tracking-widest">
                        Vertical
                      </span>
                      <span className="text-[11px] text-text-1 font-medium">{s.track}</span>
                    </div>

                    <div className="w-px h-6 bg-white/5 hidden sm:block" />

                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-3 font-bold uppercase tracking-widest">
                        Entry Date
                      </span>
                      <span className="text-[11px] text-text-1 font-mono">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="w-px h-6 bg-white/5 hidden sm:block" />

                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-3 font-bold uppercase tracking-widest">
                        Submitter
                      </span>
                      <span className="text-[11px] text-text-1 font-medium">
                        {s.submitterId?.name || 'Unknown'}
                      </span>
                    </div>

                    {s.ai?.category && (
                      <>
                        <div className="w-px h-6 bg-white/5 hidden sm:block" />
                        <div className="flex flex-col">
                          <span className="text-[9px] text-text-3 font-bold uppercase tracking-widest">
                            AI Category
                          </span>
                          <span className="text-[11px] text-text-1 font-medium">
                            {s.ai.category}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <AccessIndicator submission={s} />
                    {s.files?.length > 0 && (
                      <span className="text-[10px] text-text-3">Files: {s.files.length}</span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <Badge type={s.status}>{s.status?.replace('_', ' ')}</Badge>

                  <Link to={`/evaluator/score/${s._id}`} className="w-full md:w-auto">
                    <Button className="w-full md:w-36 py-3.5 shadow-lg shadow-green/10 hover:shadow-green/20">
                      View & Score
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="pt-8 text-center text-[10px] text-text-3/40 uppercase tracking-[0.25em] font-bold">
        Secure Evaluation Stream • ScoreFlow AI Verified
      </p>
    </div>
  )
      }
