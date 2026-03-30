import React from 'react'

export default function ProgressBar({ pct, color = '#00D4AA', height = 6 }) {
  const percentage = Math.min(Math.max(pct, 0), 100)

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Percentage Label - Optional but recommended for UX */}
      <div className="flex justify-end">
        <span 
          className="text-[10px] font-bold font-mono tracking-tighter"
          style={{ color }}
        >
          {Math.round(percentage)}%
        </span>
      </div>

      <div
        className="relative w-full rounded-full overflow-hidden bg-white/5 shadow-inner shadow-black/20"
        style={{ height }}
      >
        {/* Progress Fill */}
        <div
          className="relative h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}33` // Subtle outer glow
          }}
        >
          {/* Animated Shimmer/Highlight */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
          
          {/* Top Edge Highlight for depth */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  )
}