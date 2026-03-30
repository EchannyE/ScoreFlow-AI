import React from 'react'

const base = 
  'w-full bg-bg-3/50 border border-white/5 rounded-[12px] text-text-1 text-sm px-4 py-3 ' +
  'hover:border-white/10 hover:bg-bg-3/80 ' +
  'focus:bg-bg-3 focus:ring-2 focus:ring-green/20 focus:border-green outline-none ' +
  'transition-all duration-200 placeholder:text-text-3/60 shadow-inner shadow-black/5'

export default function Input({
  label, value, onChange, type = 'text', placeholder,
  required, disabled = false, className = '', as: As = 'input', options, rows = 4,
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-end px-1">
          <label className="text-[10px] text-text-3 tracking-[0.08em] uppercase font-bold">
            {label}
            {required && <span className="text-red/80 ml-1">*</span>}
          </label>
        </div>
      )}

      <div className="relative group">
        {As === 'select' ? (
          <>
            <select
              value={value}
              onChange={e => onChange(e.target.value)}
              disabled={disabled}
              className={`${base} appearance-none pr-10 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              {placeholder && (
                <option value="" disabled className="bg-bg-3">
                  {placeholder}
                </option>
              )}
              {options?.map(o => (
                <option key={o.value ?? o} value={o.value ?? o} className="bg-bg-3">
                  {o.label ?? o}
                </option>
              ))}
            </select>
            {/* Custom Chevron */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3 group-hover:text-text-2 transition-colors">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1L5 5L9 1" />
              </svg>
            </div>
          </>
        ) : As === 'textarea' ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`${base} resize-none min-h-[100px] leading-relaxed`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={base}
          />
        )}
      </div>
    </div>
  )
}