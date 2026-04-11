import React from 'react'
import { DEFAULT_RUBRIC } from '../../lib/rubric.js'

export default function RubricSliders({ rubric = DEFAULT_RUBRIC, scores, onChange }) {
  return (
    <div className="space-y-8">
      {rubric.map(r => {
        const value = scores[r.id] ?? 0;
        const description = r.desc || r.description || 'Score this criterion'
        
        return (
          <div key={r.id} className="group relative">
            {/* Header Info */}
            <div className="flex justify-between items-end mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {r.label}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-text-3 border border-white/5">
                    WT: {r.weight}%
                  </span>
                </div>
                <p className="text-[11px] text-text-3 font-medium leading-none">{description}</p>
              </div>
              
              <div className="text-right">
                <span 
                  className="font-display font-black text-3xl tracking-tighter transition-all duration-300"
                  style={{ 
                    color: value > 0 ? 'var(--green)' : 'var(--text-3)',
                    textShadow: value > 70 ? `0 0 15px #00D4AA44` : 'none'
                  }}
                >
                  {value}
                </span>
                <span className="text-[10px] font-bold text-text-3 ml-1 block opacity-40">/ 100</span>
              </div>
            </div>

            {/* Slider Container */}
            <div className="relative h-6 flex items-center">
              {/* Background Track */}
              <div className="absolute w-full h-1.5 bg-bg-3 rounded-full overflow-hidden">
                {/* Active Fill Track */}
                <div 
                  className="h-full bg-gradient-to-r from-green/40 to-green transition-all duration-200 ease-out"
                  style={{ width: `${value}%` }}
                />
              </div>

              {/* Native Range Input (Transparent, handles interaction) */}
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={e => onChange(r.id, +e.target.value)}
                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
              />

              {/* Custom Thumb Visual */}
              <div 
                className="absolute w-5 h-5 bg-white rounded-full border-4 border-bg-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none z-10 transition-transform group-hover:scale-110"
                style={{ 
                  left: `calc(${value}% - 10px)`,
                  boxShadow: value > 0 ? `0 0 12px #00D4AA66` : 'none'
                }}
              />
            </div>

            {/* Subtle Progress Markers */}
            <div className="flex justify-between px-1 mt-2 pointer-events-none">
              {[0, 25, 50, 75, 100].map(mark => (
                <div key={mark} className="flex flex-col items-center gap-1">
                  <div className={`w-[1px] h-1 ${value >= mark ? 'bg-green/40' : 'bg-white/10'}`} />
                  <span className="text-[8px] font-mono text-text-3/40">{mark}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}