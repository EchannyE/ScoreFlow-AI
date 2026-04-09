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
  const { submissions = [], loading } = useMySubmissions()

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
        ].filter(Boolean).length

        const displayScore = s.finalScore ?? s.ai?.suggestedScore ?? 0
        const isFinal = s.finalScore != null

        return (
          <Card key={s._id} className="mb-3">
            <div className="flex items-start gap-4">
              <ScoreRing
                score={displayScore}
                size={52}
                color={isFinal ? '#00D4AA' : '#F5A623'}
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
                    {isFinal ? (
                      <div className="text-[11px] text-green mt-1.5">
                        Final Score: {s.finalScore}
                      </div>
                    ) : s.ai?.suggestedScore != null ? (
                      <div className="text-[11px] text-yellow-500 mt-1.5">
                        AI Score: {s.ai.suggestedScore}
                      </div>
                    ) : null}
                  </div>
                </div>

                <p className="text-xs text-text-2 leading-7 mb-3">
                  {s.ai?.summary ?? s.fields?.description ?? 'Processing…'}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                  <AccessLink href={s.fields?.projectUrl} label="Project Link" />
                  <AccessLink href={s.fields?.githubUrl} label="GitHub" />
                  <AccessLink href={s.fields?.demoUrl} label="Demo" />
                  <AccessLink
                    href={s.fields?.fileUrl}
                    label={s.fields?.fileName || 'Attachment'}
                  />
                </div>

                <div className="flex flex-wrap gap-3 text-[11px]">
                  <span className="text-text-3">
                    Access links: {accessCount}
                  </span>

                  <span
                    className={
                      accessCount > 0
                        ? 'text-green'
                        : 'text-red'
                    }
                  >
                    {accessCount > 0
                      ? 'Evaluator can access project'
                      : 'No evaluator access link provided'}
                  </span>

                  {s.aiStatus && (
                    <span className="text-text-3">
                      AI: {s.aiStatus}
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
