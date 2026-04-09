import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEvaluatorQueue, useAssignedSubmission } from '../../hooks/useEvaluation.js'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import RubricSliders, { RUBRIC } from '../../components/shared/RubricSliders.jsx'
import AIScoreReveal from '../../components/evaluation/AiScoreReveal.jsx'
import ScoreSummary from '../../components/evaluation/ScoreSummary.jsx'

const DEFAULT_SCORES = {
  innovation: 70,
  feasibility: 70,
  impact: 70,
  presentation: 70,
}

function AccessLink({ href, label }) {
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center text-xs text-green underline underline-offset-2 hover:opacity-80"
    >
      {label}
    </a>
  )
}

export default function EvaluatorScore() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const { submitScore } = useEvaluatorQueue()
  const { submission, loading, error } = useAssignedSubmission(submissionId)

  const [scores, setScores] = useState(DEFAULT_SCORES)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedEvaluation, setSubmittedEvaluation] = useState(null)

  const weightedScore = useMemo(
    () =>
      Math.round(
        RUBRIC.reduce(
          (acc, rubricItem) =>
            acc + (scores[rubricItem.id] ?? 0) * (rubricItem.weight / 100),
          0
        )
      ),
    [scores]
  )

  const aiScore = submission?.ai?.suggestedScore ?? 0
  const scoreDelta = weightedScore - aiScore

  const handleSubmit = async () => {
    if (!submission) return

    try {
      setSubmitting(true)

      const evaluation = await submitScore({
        submissionId,
        campaignId: submission.campaignId,
        scores,
        note,
        status: 'submitted',
      })

      setSubmittedEvaluation(evaluation)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center pt-16 space-y-4">
        <div className="text-red text-sm">{error}</div>
        <Button onClick={() => navigate('/evaluator')}>Back to Queue</Button>
      </div>
    )
  }

  if (!submission) {
    return <div className="text-text-3 text-center pt-16">Not found</div>
  }

  return (
    <div className="fade-up">
      <button
        onClick={() => navigate('/evaluator')}
        className="bg-transparent border-none text-text-2 text-xs cursor-pointer font-mono mb-6 hover:text-text-1 transition-colors"
      >
        ‹ Back to queue
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <Card>
            <div className="text-[11px] text-green uppercase tracking-widest mb-2.5">
              Submission
            </div>

            <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
              <div>
                <h3 className="font-display font-bold text-xl mb-2">
                  {submission.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-[11px] text-text-3">
                  <span>Track: {submission.track}</span>
                  <span>
                    Submitter:{' '}
                    {submission.submitterId?.name || submission.submitter?.name || 'Unknown'}
                  </span>
                  {submission.createdAt && (
                    <span>
                      Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge type="info">{submission.track}</Badge>
                {submission.ai?.priority && (
                  <Badge type={submission.ai.priority}>{submission.ai.priority}</Badge>
                )}
                <Badge type={submission.status}>
                  {submission.status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[11px] text-text-3 uppercase tracking-widest mb-2">
                  Project Description
                </div>
                <p className="text-sm text-text-2 leading-7">
                  {submission.fields?.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="text-[11px] text-text-3 uppercase tracking-widest mb-2">
                  AI Summary
                </div>
                <p className="text-sm text-text-2 leading-7">
                  {submission.ai?.summary || 'AI summary not available yet.'}
                </p>
              </div>

              <div>
                <div className="text-[11px] text-text-3 uppercase tracking-widest mb-2">
                  Project Access
                </div>

                <div className="flex flex-wrap gap-4">
                  <AccessLink href={submission.fields?.projectUrl} label="Open Project" />
                  <AccessLink
                    href={submission.fields?.githubUrl}
                    label="GitHub Repository"
                  />
                  <AccessLink href={submission.fields?.demoUrl} label="Live Demo" />
                  <AccessLink
                    href={submission.fields?.fileUrl}
                    label={submission.fields?.fileName || 'Attachment'}
                  />
                  {submission.files?.map((file, index) => (
                    <AccessLink
                      key={`${file.url}-${index}`}
                      href={file.url}
                      label={file.name || `File ${index + 1}`}
                    />
                  ))}
                </div>

                {!submission.fields?.projectUrl &&
                  !submission.fields?.githubUrl &&
                  !submission.fields?.demoUrl &&
                  !submission.fields?.fileUrl &&
                  !(submission.files?.length > 0) && (
                    <p className="text-xs text-red mt-2">
                      No project access links or files were provided.
                    </p>
                  )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-[11px] text-text-3 uppercase tracking-widest mb-5">
              Score by Rubric
            </div>

            <RubricSliders
              scores={scores}
              onChange={(key, val) =>
                setScores(prev => ({ ...prev, [key]: val }))
              }
            />

            <Input
              as="textarea"
              label="Evaluator Notes"
              value={note}
              onChange={setNote}
              placeholder="Add your evaluation notes…"
              rows={4}
              className="mt-2"
            />
          </Card>
        </div>

        <div className="flex flex-col gap-3.5">
          <ScoreSummary
            scores={scores}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
          <AIScoreReveal aiScore={submission.ai?.suggestedScore ?? 0} />
        </div>
      </div>

      {submittedEvaluation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-4xl rounded-[28px] border border-white/10 bg-bg-1/95 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5 md:px-8">
              <div>
                <div className="text-[10px] text-green font-bold uppercase tracking-[0.2em] mb-2">
                  Evaluation Submitted
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-white">
                  Score Comparison Review
                </h3>
                <p className="mt-2 text-sm text-text-3 max-w-2xl">
                  Your evaluation is now locked in. Review how your final weighted
                  score compares with the AI suggestion before returning to the queue.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/evaluator')}
                className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-3 hover:text-white hover:border-white/20 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
              <div className="space-y-4">
                <div className="rounded-[22px] border border-white/5 bg-bg-2/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-text-3 font-bold uppercase tracking-[0.18em] mb-1">
                        Submission
                      </div>
                      <div className="text-lg font-bold text-white">
                        {submission.title}
                      </div>
                    </div>
                    <Badge type={submission.track ? 'info' : 'submitted'}>
                      {submission.track}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {RUBRIC.map(rubricItem => (
                      <div
                        key={rubricItem.id}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-text-1">
                            {rubricItem.label}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-text-3">
                            Weight {rubricItem.weight}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-white">
                            {submittedEvaluation.scores?.[rubricItem.id] ??
                              scores[rubricItem.id] ??
                              0}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-text-3">
                            /100
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {note && (
                    <div className="mt-4 rounded-xl border border-white/5 bg-black/10 px-4 py-3">
                      <div className="text-[10px] text-text-3 font-bold uppercase tracking-widest mb-2">
                        Your note
                      </div>
                      <p className="text-sm leading-relaxed text-text-2">{note}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[22px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[18px] border border-green/15 bg-green/5 p-4 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-green mb-3">
                        Evaluator Score
                      </div>
                      <div className="mx-auto mb-3 flex w-fit items-center justify-center rounded-full border border-green/15 bg-bg-2/80 p-3">
                        <div className="text-4xl font-display font-black text-white">
                          {submittedEvaluation.weightedScore ?? weightedScore}
                        </div>
                      </div>
                      <div className="text-[11px] text-text-3">
                        Weighted final after rubric scoring
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-purple/15 bg-purple/5 p-4 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple mb-3">
                        AI Suggestion
                      </div>
                      <div className="mx-auto mb-3 flex w-fit items-center justify-center rounded-full border border-purple/15 bg-bg-2/80 p-3">
                        <div className="text-4xl font-display font-black text-white">
                          {aiScore}
                        </div>
                      </div>
                      <div className="text-[11px] text-text-3">
                        Pre-score benchmark estimate
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-white/5 bg-bg-2/50 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-text-3 font-bold uppercase tracking-[0.18em] mb-1">
                          Delta
                        </div>
                        <div className="text-sm text-text-2">
                          Difference between your score and the AI recommendation
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-display font-black ${
                          scoreDelta >= 0 ? 'text-green' : 'text-red'
                        }`}
                      >
                        {scoreDelta > 0 ? '+' : ''}
                        {scoreDelta}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/5 bg-bg-2/40 p-5">
                  <div className="text-[10px] text-text-3 font-bold uppercase tracking-[0.18em] mb-3">
                    Next Step
                  </div>
                  <p className="text-sm leading-relaxed text-text-2 mb-5">
                    This evaluation has been submitted successfully. You can return
                    to your queue for the next assignment or stay here briefly to
                    review the outcome.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button className="flex-1" onClick={() => navigate('/evaluator')}>
                      Return To Queue
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setSubmittedEvaluation(null)}
                    >
                      Stay On This Page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
       }
