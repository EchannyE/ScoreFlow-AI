import React from 'react'

export default function Card({
    children,
    className = '',
    hover = false,
    accent,
    as = 'div',
}) {
    const Component = as

    return (
        <Component
            className={
                `relative overflow-hidden rounded-[24px] border border-white/5 
                 bg-bg-2/50 backdrop-blur-md p-7
                 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                 transition-all duration-300 ease-out
                 ${hover ? 'hover:-translate-y-1.5 hover:border-white/10 hover:bg-bg-2/80 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]' : ''}
                 ${className}`
            }
        >
            {/* Accent Strip */}
            {accent && (
                <div 
                    className="absolute left-0 top-0 bottom-0 w-[4px]" 
                    style={{ backgroundColor: accent }}
                />
            )}
            
            <div className="relative z-10">
                {children}
            </div>
        </Component>
    )
}