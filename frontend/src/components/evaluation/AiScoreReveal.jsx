import React, { useState } from 'react'
import ScoreRing from '../ui/ScoreRing.jsx'
import Button from '../ui/Button.jsx'

export default function AIScoreReveal({ aiScore }) {
  const [revealed, setRevealed] = useState(false)

  const hasAiScore = Number.isFinite(aiScore)

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/5 bg-bg-2/40 backdrop-blur-md p-6 group transition-all duration-500">
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-purple/10 to-green/10 blur-2xl transition-opacity duration-700 ${
          revealed ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple shadow-[0_0_8px_rgba(168,85,247,0.5)] animate-pulse" />
            <span className="text-[10px] text-text-3 font-bold uppercase tracking-[0.15em]">
              AI Neural Suggestion
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevealed(p => !p)}
            className="text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 py-1 px-3 h-auto"
          >
            {revealed ? 'Hide Analysis' : 'Reveal Score'}
          </Button>
        </div>

        {revealed ? (
          hasAiScore ? (
            <div className="flex flex-col items-center justify-center py-2 animate-fade-in">
              <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 rounded-full bg-purple/20 blur-xl animate-pulse" />
                <ScoreRing score={aiScore} size={80} color="#A855F7" />
              </div>

              <div className="text-center space-y-1">
                <div className="text-[10px] font-bold text-purple uppercase tracking-[0.2em]">
                  Bias Protected
                </div>
                <p className="text-[11px] text-text-3 max-w-[200px] leading-relaxed italic opacity-80">
                  Suggested score based on historical campaign benchmarks.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 border border-white/5 rounded-xl bg-black/10 animate-fade-in">
              <div className="text-[18px] mb-2 opacity-50">🧠</div>
              <div className="text-[10px] font-bold text-text-3 uppercase tracking-[0.18em] mb-2">
                AI Not Ready
              </div>
              <p className="text-[11px] text-text-3 text-center px-8 leading-relaxed">
                The AI suggestion is still processing or unavailable for this submission.
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-white/5 rounded-xl bg-black/10">
            <div className="text-[18px] mb-2 opacity-30">🔒</div>
            <p className="text-[11px] text-text-3 text-center px-8 font-medium leading-relaxed">
              Complete your independent evaluation to unlock the{' '}
              <span className="text-purple/80">AI perspective</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
