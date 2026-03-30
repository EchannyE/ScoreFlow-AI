import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { submissionsAPI, evaluationsAPI } from '../../lib/api.jsx'
import { useUsers } from '../../hooks/useUsers.js'
import Card      from '../../components/ui/Card.jsx'
import Badge     from '../../components/ui/Badge.jsx'
import Button    from '../../components/ui/Button.jsx'
import Input     from '../../components/ui/Input.jsx'
import ScoreRing from '../../components/ui/ScoreRing.jsx'
import Spinner   from '../../components/ui/Spinner.jsx'

const RUBRIC = ['innovation', 'feasibility', 'impact', 'presentation']

export default function SubmissionDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { users: evaluators, loading: evaluatorsLoading } = useUsers({ role: 'evaluator' })
  const [sub,    setSub]    = useState(null)
  const [evals,  setEvals]  = useState([])
  const [loading,setLoading]= useState(true)
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  useEffect(() => {
    Promise.all([submissionsAPI.get(id), evaluationsAPI.list({ submissionId: id })])
      .then(([s, e]) => { 
        const submission = s.data.data ?? s.data
        setSub(submission)
        setSelectedEvaluatorId(submission.assignedEvaluatorId?._id ?? '')
        setEvals(e.data.data ?? e.data) 
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAssign = async () => {
    if (!selectedEvaluatorId) {
      setAssignError('Select an evaluator first.')
      return
    }

    try {
      setAssigning(true)
      setAssignError('')
      const response = await submissionsAPI.assign(id, selectedEvaluatorId)
      setSub(response.data)
    } catch (error) {
      setAssignError(error.response?.data?.message ?? error.message)
    } finally {
      setAssigning(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size={40} />
      <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest animate-pulse">
        Loading Detailed Audit...
      </span>
    </div>
  )
  
  if (!sub) return <div className="text-text-3 text-center pt-16">Entry not found in system.</div>

  return (
    <div className="fade-up space-y-6">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => navigate('/admin/submissions')}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 
                     text-text-3 text-[11px] font-bold uppercase tracking-widest hover:text-white 
                     hover:bg-white/10 transition-all active:scale-95"
        >
          <span className="transition-transform group-hover:-translate-x-1">‹</span> Back to Master Log
        </button>
        
        <div className="flex gap-2">
          {sub.flagged && <Badge type="flagged" className="animate-pulse">Active Flag</Badge>}
          <Badge type={sub.status}>{sub.status?.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 items-start">
        
        {/* Left Column: Submission Content & AI Perspective */}
        <div className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] text-green font-bold uppercase tracking-[0.2em] mb-2 block">
                    Submission Detail // {sub.track}
                  </span>
                  <h3 className="font-display font-bold text-3xl tracking-tight text-white">
                    {sub.title}
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-6 pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Submitter</span>
                    <span className="text-sm font-medium text-white">{sub.submitter?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Entry ID</span>
                    <span className="text-sm font-mono text-text-2">#{id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Assigned Evaluator</span>
                    <span className="text-sm font-medium text-white">{sub.assignedEvaluatorId?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {sub.finalScore != null && (
                <div className="flex flex-col items-center bg-bg-3/50 p-4 rounded-2xl border border-white/5">
                  <ScoreRing score={sub.finalScore} size={80} strokeWidth={6} />
                  <span className="text-[9px] font-bold text-text-3 uppercase tracking-[0.2em] mt-3">Final Average</span>
                </div>
              )}
            </div>
          </Card>

          {/* AI Insights Card */}
          <Card className="border-purple/20 relative group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
               <span className="text-2xl">🧠</span>
            </div>
            <div className="text-[10px] text-purple font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
              AI Neural Summary
            </div>
            <p className="text-sm text-text-2 leading-relaxed italic">
              "{sub.ai?.summary ?? 'AI analysis is currently being processed for this submission.'}"
            </p>
          </Card>

          <Card className="border-green/10">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] text-green font-bold uppercase tracking-[0.2em] mb-2 block">
                  Assignment Control
                </span>
                <h4 className="text-lg font-bold text-white tracking-tight">Assign To Evaluator</h4>
                <p className="text-sm text-text-3 mt-2 leading-relaxed">
                  Route this submission into a specific evaluator queue. Reassigning updates the active owner unless the submission has already been scored.
                </p>
              </div>

              <Input
                as="select"
                label="Evaluator"
                value={selectedEvaluatorId}
                onChange={setSelectedEvaluatorId}
                disabled={evaluatorsLoading || sub.status === 'scored'}
                placeholder={evaluatorsLoading ? 'Loading evaluators...' : 'Choose an evaluator'}
                options={evaluators.map(evaluator => ({
                  value: evaluator._id,
                  label: evaluator.name,
                }))}
              />

              {assignError && (
                <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-xs text-red">
                  {assignError}
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="text-[10px] text-text-3 font-bold uppercase tracking-widest">
                  {sub.status === 'scored'
                    ? 'Scored submissions are locked'
                    : sub.assignedAt
                      ? `Assigned ${new Date(sub.assignedAt).toLocaleString()}`
                      : 'Not yet assigned'}
                </div>
                <Button
                  onClick={handleAssign}
                  disabled={assigning || evaluatorsLoading || sub.status === 'scored' || !selectedEvaluatorId}
                >
                  {assigning ? 'Assigning...' : sub.assignedEvaluatorId ? 'Reassign Submission' : 'Assign Submission'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Human Evaluations Audit */}
        <Card className="bg-bg-1/40 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Human Peer Review</span>
              <h4 className="text-lg font-bold text-white tracking-tight">Evaluations ({evals.length})</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-3 text-lg">
              ⚖
            </div>
          </div>

          <div className="space-y-4">
            {evals.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-xs text-text-3 font-bold uppercase tracking-widest">Queue empty</p>
              </div>
            ) : (
              evals.map(ev => (
                <div key={ev._id} className="bg-bg-3/50 rounded-2xl p-5 border border-white/5 transition-all hover:bg-bg-3 hover:border-white/10">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-text-2">
                        {ev.evaluatorId?.name?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white">{ev.evaluatorId?.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-display font-black text-green tracking-tighter leading-none">
                        {ev.weightedScore}
                      </span>
                      <span className="text-[8px] text-text-3 font-bold uppercase tracking-widest">Weighted</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {RUBRIC.map(r => (
                      <div key={r} className="flex items-center gap-4">
                        <span className="text-[9px] text-text-3 font-bold uppercase tracking-tighter w-20 truncate">{r}</span>
                        <div className="flex-1 h-[4px] bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green/60 rounded-full transition-all duration-1000"
                            style={{ width: `${ev.scores?.[r] ?? 0}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-green w-6 text-right">
                          {ev.scores?.[r] ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ev.note && (
                    <div className="mt-5 pt-4 border-t border-white/5">
                      <p className="text-[11px] text-text-3 italic leading-relaxed">
                        <span className="text-white opacity-40 mr-1">"</span>
                        {ev.note}
                        <span className="text-white opacity-40 ml-1">"</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}