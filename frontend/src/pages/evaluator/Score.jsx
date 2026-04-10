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
  const { submission, loading, error, refetch } = useAssignedSubmission(submissionId)

  const [scores, setScores] = useState(DEFAULT_SCORES)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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

  const aiScore =
    submission?.aiStatus === 'completed' &&
    Number.isFinite(submission?.ai?.suggestedScore)
      ? submission.ai.suggestedScore
      : null

  const handleSubmit = async () => {
    if (!submission || submitting) return

    try {
      setSubmitting(true)
      setSubmitError('')

      const evaluation = await submitScore({
        submissionId,
        campaignId: submission.campaignId,
        scores,
        note,
        status: 'submitted',
      })

      Promise.resolve(refetch?.()).catch(() => {})

      const finalWeightedScore = evaluation?.weightedScore ?? weightedScore
      const scoreDelta =
        aiScore == null ? null : finalWeightedScore - aiScore

      navigate('/evaluator', {
        replace: true,
        state: {
          recentlyScored: {
            submissionId,
            title: submission.title,
            weightedScore: finalWeightedScore,
            aiScore,
            scoreDelta,
          },
        },
      })
    } catch (e) {
      setSubmitError(
        e?.response?.data?.message ||
        e?.message ||
        'Failed to submit evaluation.'
      )
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

      {submitError && (
        <div className="mb-4 rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">
          {submitError}
        </div>
      )}

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
                  <AccessLink href={submission.fields?.githubUrl} label="GitHub Repository" />
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
          <AIScoreReveal aiScore={aiScore} />
        </div>
      </div>
    </div>
  )
}
