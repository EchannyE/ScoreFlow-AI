import React from 'react'

export default function NotificationDrawer({ notifications, onMarkRead, onClose }) {
  return (
    <div className="h-full bg-bg-1/95 backdrop-blur-xl border-l border-white/5 
                    p-8 flex flex-col shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-xl tracking-tight">Notifications</span>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-green/10 text-green text-[10px] font-bold uppercase tracking-wider">
              {notifications.filter(n => !n.read).length} New
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 
                     text-text-3 hover:text-white hover:bg-white/10 transition-all active:scale-90"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 1L13 13M1 13L13 1" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-40">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-text-3 mb-4" />
            <p className="text-xs font-medium tracking-wide">All caught up</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              onClick={() => onMarkRead(n._id)}
              className={`relative group p-4 rounded-xl border transition-all duration-200 cursor-pointer
                ${n.read 
                  ? 'border-white/5 bg-transparent opacity-60 hover:opacity-100 hover:bg-white/[0.02]' 
                  : 'border-green/20 bg-green/5 hover:bg-green/[0.08] shadow-lg shadow-green/[0.02]'}`}
            >
              {!n.read && (
                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_8px_#00D4AA]" />
              )}
              
              <div className={`text-xs leading-relaxed font-medium mb-2 ${n.read ? 'text-text-2' : 'text-white'}`}>
                {n.message}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-3 font-semibold uppercase tracking-tighter">
                  {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                {!n.read && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-text-3/30" />
                    <span className="text-[10px] font-bold text-green uppercase tracking-widest">New</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/5 flex-shrink-0">
        <button className="text-[11px] font-bold text-text-3 hover:text-green transition-colors uppercase tracking-[0.15em] w-full text-center">
          Clear All History
        </button>
      </div>
    </div>
  )
}