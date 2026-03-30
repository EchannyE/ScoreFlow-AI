import React from 'react'

const VARIANTS = {
  primary:   'bg-green text-bg-0 border-transparent hover:bg-green/90 shadow-sm shadow-green/10',
  secondary: 'bg-bg-1 text-text-1 border border-border hover:border-text-3 hover:bg-bg-2',
  danger:    'bg-red/5 text-red border border-red/20 hover:bg-red/10 hover:border-red/40',
  ghost:     'bg-transparent text-text-2 border-transparent hover:bg-white/5 hover:text-text-1',
  purple:    'bg-purple text-white border-transparent hover:bg-purple/90 shadow-sm shadow-purple/10',
}

const SIZES = {
  sm: 'text-[11px] px-3 py-1.5 gap-1.5',
  md: 'text-xs px-4 py-2 gap-2',
  lg: 'text-sm px-6 py-3 gap-2.5',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  onClick, disabled, className = '', type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        `inline-flex items-center justify-center rounded-[10px] font-sans font-semibold
         tracking-tight transition-all duration-200 cursor-pointer
         active:scale-[0.97] active:duration-75
         disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
         ${VARIANTS[variant]} ${SIZES[size]} ${className}`
      }
    >
      {children}
    </button>
  )
}