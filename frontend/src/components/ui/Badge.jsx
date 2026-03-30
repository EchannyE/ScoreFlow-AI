import React from 'react'

const STYLES = {
  active:       'bg-green/10   text-green    border-green/20   has-dot',
  closed:       'bg-text-2/10  text-text-2   border-text-2/20',
  draft:        'bg-blue/10    text-blue     border-blue/20',
  submitted:    'bg-blue/10    text-blue     border-blue/20',
  under_review: 'bg-orange/10  text-orange   border-orange/20  has-dot',
  scored:       'bg-green/10   text-green    border-green/20',
  shortlisted:  'bg-purple/10  text-purple   border-purple/20',
  flagged:      'bg-red/10     text-red      border-red/20     has-dot',
  overdue:      'bg-red/10     text-red      border-red/20',
  warning:      'bg-orange/10  text-orange   border-orange/20',
  success:      'bg-green/10   text-green    border-green/20',
  info:         'bg-blue/10    text-blue     border-blue/20',
  admin:        'bg-purple/10  text-purple   border-purple/20',
  evaluator:    'bg-blue/10    text-blue     border-blue/20',
  submitter:    'bg-green/10   text-green    border-green/20',
}

export default function Badge({ type = 'info', children, className = '' }) {
  const styleConfig = STYLES[type] ?? STYLES.info
  const hasDot = styleConfig.includes('has-dot')

  return (
    <span className={
      `inline-flex items-center justify-center gap-1.5 
       text-[9px] font-bold tracking-[0.05em] uppercase
       px-2 py-0.5 rounded-full border transition-all duration-200
       ${styleConfig.replace('has-dot', '')} 
       ${className}`
    }>
      {hasDot && (
        <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
      )}
      <span className="leading-none">{children}</span>
    </span>
  )
}