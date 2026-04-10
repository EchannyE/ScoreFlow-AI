import React from 'react'
import { Link } from 'react-router-dom'
import { useMySubmissions } from '../../hooks/useSubmission.js'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ScoreRing from '../../components/ui/ScoreRing.jsx'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

function AccessLink({ href, label }) {
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-[11px] text-green underline underline-offset-2 hover:opacity-80"
    >
      {label}
    </a>
  )
}

export default function MySubmissions() {
  const { submissions = [], loading, error } = useMySubmissions()

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="fade-up">
      <div className="flex justify-between items-center mb-7">
        <div>
          <div className="text-[11px] text-green uppercase tracking-[0.18em] mb-1.5">
            // submitter
          </div>
          <h2 className="font-display font-bold text-[26px] tracking-tight">
            My Submissions
          </h2>
        </div>

        <Link to="/submitter/new">
          <Button>+ New Submission</Button>
        </Link>
      </div>

      {error && (
        <Card className="mb-4 border border-red/20 bg-red/5">
          <div className="text-sm text-red">{error}</div>
        </Card>
      )}

      {submissions.length === 0 && (
        <Card className="text-center !py-16">
          <div className="text-5xl mb-3">⬆</div>
          <div className="text-[15px] mb-2">No submissions yet</div>
          <div className="text-xs text-text-3 mb-5">
            Submit your first entry to get started
          </div>
          <Link to="/submitter/new">
            <Button>Submit Entry →</Button>
          </Link>
        </Card>
      )}

      {submissions.map(s => {
        const accessCount = [
          s.fields?.projectUrl,
          s.fields?.githubUrl,
          s.fields?.demoUrl,
          s.fields?.fileUrl,
          ...(Array.isArray(s.files) ? s.files.map(file => file?.url) : []),
        ].filter(Boolean).length

        const isCompleted = s.status === 'completed'
        const hasFinalScore = s.finalScore != null
        const hasAiScore = s.ai?.suggestedScore != null

        const displayScore = isCompleted && hasFinalScore
          ? s.finalScore
          : hasAiScore
            ? s.ai.suggestedScore
            : 0

        const scoreColor = isCompleted && hasFinalScore
          ? '#00D4AA'
          : '#F5A623'

        const summaryText =
          s.ai?.summary ||
          s.fields?.description ||
          'Processing…'

        return (
          <Card key={s._id} className="mb-3">
            <div className="flex items-start gap-4">
              <ScoreRing
                score={displayScore}
                size={52}
                color={scoreColor}
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium mb-1.5">{s.title}</div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-text-3">
                      <span>Track: {s.track}</span>
                      <span>{s.createdAt?.slice(0, 10)}</span>
                      {s.assignedEvaluatorId && <span>Evaluator assigned</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge type={s.status}>{s.status?.replace('_', ' ')}</Badge>

                    {isCompleted && hasFinalScore ? (
                      <div className="text-[11px] text-green mt-1.5 font-medium">
                        Final Score: {s.finalScore}
                      </div>
                    ) : hasAiScore ? (
                      <div className="text-[11px] text-yellow-500 mt-1.5">
                        AI Preview: {s.ai.suggestedScore}
                      </div>
                    ) : (
                      <div className="text-[11px] text-text-3 mt-1.5">
                        Awaiting score
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-text-2 leading-7 mb-3">
                  {summaryText}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                  <AccessLink href={s.fields?.projectUrl} label="Project Link" />
                  <AccessLink href={s.fields?.githubUrl} label="GitHub" />
                  <AccessLink href={s.fields?.demoUrl} label="Demo" />
                  <AccessLink
                    href={s.fields?.fileUrl}
                    label={s.fields?.fileName || 'Attachment'}
                  />
                  {Array.isArray(s.files) &&
                    s.files.map((file, index) => (
                      <AccessLink
                        key={`${file?.url || 'file'}-${index}`}
                        href={file?.url}
                        label={file?.name || `File ${index + 1}`}
                      />
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 text-[11px]">
                  <span className="text-text-3">
                    Access links: {accessCount}
                  </span>

                  <span className={accessCount > 0 ? 'text-green' : 'text-red'}>
                    {accessCount > 0
                      ? 'Evaluator can access project'
                      : 'No evaluator access link provided'}
                  </span>

                  {s.aiStatus && (
                    <span className="text-text-3">
                      AI: {s.aiStatus}
                    </span>
                  )}

                  {isCompleted && s.scoredAt && (
                    <span className="text-green">
                      Scored on {new Date(s.scoredAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
