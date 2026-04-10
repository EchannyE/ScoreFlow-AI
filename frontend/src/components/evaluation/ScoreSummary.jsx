import React from 'react'
import { RUBRIC } from '../shared/RubricSliders.jsx'
import ScoreRing from '../ui/ScoreRing.jsx'
import Button from '../ui/Button.jsx'

export default function ScoreSummary({ scores, onSubmit, submitting }) {
  const weighted = Math.round(
    RUBRIC.reduce((acc, r) => acc + (scores[r.id] ?? 0) * (r.weight / 100), 0)
  )

  const color =
    weighted >= 80 ? '#00D4AA' :
    weighted >= 60 ? '#F5A623' :
    '#E05260'

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/5 bg-bg-2/60 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500">
      <div
        className="absolute -top-24 -left-24 w-48 h-48 blur-[80px] opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <header className="mb-6">
          <div className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em] mb-1">
            Final Evaluation
          </div>
          <h3 className="text-white text-lg font-bold tracking-tight leading-none">
            Weighted Total
          </h3>
        </header>

        <div className="relative mb-10 group cursor-default">
          <div
            className="absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"
            style={{ backgroundColor: color }}
          />
          <ScoreRing score={weighted} size={120} color={color} strokeWidth={8} />
        </div>

        <div className="w-full space-y-3 mb-8">
          <div className="flex justify-between px-1 text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-50">
            <span>Criteria</span>
            <span>Contribution</span>
          </div>

          <div className="space-y-1.5">
            {RUBRIC.map(r => {
              const rawScore = scores[r.id] ?? 0
              const contribution = ((rawScore * r.weight) / 100).toFixed(1)

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-bold text-text-1">{r.label}</span>
                    <span className="text-[9px] text-text-3 font-medium opacity-60">
                      Weight: {r.weight}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-text-3">
                      {rawScore}/100
                    </span>
                    <div className="w-px h-3 bg-white/10" />
                    <span
                      className="text-xs font-bold font-mono"
                      style={{ color: weighted > 0 ? color : '#94A3B8' }}
                    >
                      +{contribution}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-full pt-6 border-t border-white/5 space-y-5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-text-3 font-bold uppercase tracking-widest">
              Confidence Index
            </span>
            <span className="text-[10px] text-white font-mono font-bold uppercase tracking-widest">
              {weighted >= 80 ? 'High (Verified)' : 'Standard'}
            </span>
          </div>

          <div
            style={{
              boxShadow: submitting ? 'none' : `0 10px 30px ${color}15`,
              borderRadius: '10px',
            }}
          >
            <Button
              onClick={onSubmit}
              disabled={submitting || weighted === 0}
              className="w-full py-6 font-bold text-sm transition-all active:scale-[0.98]"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Finalizing...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Evaluation <span className="text-lg leading-none">✓</span>
                </span>
              )}
            </Button>
          </div>

          <p className="text-[10px] text-text-3/40 italic">
            Evaluation is final once submitted and cannot be edited.
          </p>
        </div>
      </div>
    </div>
  )
}
