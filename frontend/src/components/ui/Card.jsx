import React from 'react'

function Card({
  children,
  className = '',
  hover = false,
  accent,
  as = 'div',
  ...props
}) {
  const Component = as

  return (
    <Component
      role={as === 'div' ? 'region' : undefined}
      className={[
        'relative overflow-hidden rounded-[24px] border border-white/5',
        'bg-bg-2/50 backdrop-blur-md p-7',
        accent ? 'pl-[10px]' : '',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
        'transition-all duration-300 ease-out',
        hover
          ? 'cursor-pointer hover:-translate-y-1.5 hover:border-white/10 hover:bg-bg-2/80 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {accent && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[4px]"
          style={{ backgroundColor: accent }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />
      </div>

      <div className="relative z-10">{children}</div>
    </Component>
  )
}

export default React.memo(Card)
