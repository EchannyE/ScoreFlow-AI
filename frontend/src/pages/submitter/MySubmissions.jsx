import React from 'react'
import { Link } from 'react-router-dom'
import { useMySubmissions } from '../../hooks/useSubmission.js'
import Card      from '../../components/ui/Card.jsx'
import Badge     from '../../components/ui/Badge.jsx'
import ScoreRing from '../../components/ui/ScoreRing.jsx'
import Button    from '../../components/ui/Button.jsx'
import Spinner   from '../../components/ui/Spinner.jsx'
 
export default function MySubmissions() {
  const { submissions, loading } = useMySubmissions()
  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>
 
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
        <Link to="/submitter/new"><Button>+ New Submission</Button></Link>
      </div>
 
      {submissions.length === 0 && (
        <Card className="text-center !py-16">
          <div className="text-5xl mb-3">⬆</div>
          <div className="text-[15px] mb-2">No submissions yet</div>
          <div className="text-xs text-text-3 mb-5">Submit your first entry to get started</div>
          <Link to="/submitter/new"><Button>Submit Entry →</Button></Link>
        </Card>
      )}
 
      {submissions.map(s => (
        <Card key={s._id} className="mb-3">
          <div className="flex items-center gap-4">
            <ScoreRing
              score={s.finalScore ?? s.ai?.suggestedScore ?? 0}
              size={52}
              color={s.finalScore ? '#00D4AA' : '#F5A623'}
            />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1.5">{s.title}</div>
              <p className="text-xs text-text-2 leading-7 mb-2">
                {s.ai?.summary ?? 'Processing…'}
              </p>
              <div className="flex gap-3">
                <span className="text-[11px] text-text-3">Track: {s.track}</span>
                <span className="text-[11px] text-text-3">{s.createdAt?.slice(0, 10)}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge type={s.status}>{s.status?.replace('_', ' ')}</Badge>
              {s.finalScore != null && (
                <div className="text-[11px] text-green mt-1.5">Score: {s.finalScore}</div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
 