import React from 'react'

export default function ScoreRing({ score = 0, size = 56, color = '#00D4AA' }) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0

  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (safeScore / 100) * circ

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-20"
        style={{ backgroundColor: color }}
      />

      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1A2236"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>

      <div
        className="absolute inset-0 flex items-center justify-center font-display font-bold"
        style={{ fontSize: size * 0.24, color }}
      >
        {safeScore}
      </div>
    </div>
  )
}
