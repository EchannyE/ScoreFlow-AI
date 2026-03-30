import React from 'react'

export default function Spinner({ size = 32, color = '#00D4AA' }) {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Track (Static) */}
      <div 
        className="absolute inset-0 rounded-full border-[2.5px] border-white/5" 
      />
      
      {/* Animated Gradient Spinner */}
      <div 
        className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-current animate-spin"
        style={{ 
          color: color,
          borderTopColor: color,
          filter: `drop-shadow(0 0 2px ${color}44)`
        }}
      />

      {/* Center Glow Pulse */}
      <div 
        className="w-1/4 h-1/4 rounded-full animate-pulse"
        style={{ backgroundColor: color, opacity: 0.4 }}
      />

      {/* Hidden screen-reader text for accessibility */}
      <span className="sr-only">Loading...</span>
    </div>
  )
}