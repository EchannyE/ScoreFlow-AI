import React from 'react'
import Card from './Card.jsx'

export default function StatCard({
  label,
  value,
  color = '#00D4AA',
  icon,
  pct = 40, // optional dynamic percentage
}) {
  const safeValue = value ?? 0
  const safePct = Math.max(0, Math.min(100, Number(pct) || 0))

  return (
    <Card className="!p-6 group overflow-hidden relative">
      {/* Decorative Corner Glow */}
      <div
        className="absolute -top-6 -right-6 w-12 h-12 blur-[30px] opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-text-3 uppercase tracking-[0.1em] leading-none">
            {label}
          </span>

          <div
            className="font-display font-extrabold text-3xl tracking-tighter leading-tight transition-transform duration-300 group-hover:scale-105 origin-left"
            style={{ color }}
          >
            {safeValue}
          </div>
        </div>

        {icon && (
          <div
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-xl transition-all duration-300 group-hover:bg-white/10 group-hover:scale-110"
            style={{ color }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Mini Trend/Indicator Line */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full opacity-60 transition-all duration-500"
            style={{ backgroundColor: color, width: `${safePct}%` }}
          />
        </div>

        <div
          className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentcolor]"
          style={{ backgroundColor: color, color }}
        />
      </div>
    </Card>
  )
}
