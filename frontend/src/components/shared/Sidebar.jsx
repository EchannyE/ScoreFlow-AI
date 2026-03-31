import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/useApp.jsx'
import Badge from '../ui/Badge.jsx'

const NAV = {
  admin: [
    { to: '/admin',             icon: '⊞', label: 'Dashboard'   },
    { to: '/admin/campaigns',   icon: '◈', label: 'Campaigns'   },
    { to: '/admin/submissions', icon: '⬆', label: 'Submissions' },
    { to: '/admin/evaluators',  icon: '⚖', label: 'Evaluators'  },
  ],
  evaluator: [
    { to: '/evaluator', icon: '⚖', label: 'My Queue' },
  ],
  submitter: [
    { to: '/submitter',     icon: '⬆', label: 'My Submissions' },
    { to: '/submitter/new', icon: '+', label: 'New Submission'  },
  ],
}

export default function Sidebar({ unread, onNotifClick }) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const items    = NAV[currentUser?.role] ?? []

  return (
    <aside className="w-[260px] bg-bg-1 border-r border-white/5 flex flex-col
                      flex-shrink-0 h-screen sticky top-0 z-50">

      {/* Brand Header */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green to-purple
                          flex items-center justify-center font-display font-bold
                          text-lg text-bg-0 flex-shrink-0 shadow-lg shadow-green/10
                          transition-transform group-hover:scale-110">
            S
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-base tracking-tight text-white leading-tight">
              ScoreFlow <span className="text-green">AI</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 mt-1 rounded bg-white/5 border border-white/5">
              <span className="w-1 h-1 rounded-full bg-green animate-pulse" />
              <span className="text-[9px] text-text-3 tracking-[0.15em] font-bold uppercase">System v1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-1">
        <div className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em] px-3 mb-2 opacity-50">
          Main Menu
        </div>
        {items.map(item => (
          <NavLink key={item.to} to={item.to} end
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
               transition-all duration-200 group
               ${isActive
                 ? 'text-green bg-green/5 shadow-[inset_0_0_12px_rgba(0,212,170,0.02)]'
                 : 'text-text-2 hover:text-white hover:bg-white/[0.03]'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-green rounded-r-full shadow-[2px_0_8px_#00D4AA]" />
                )}
                <span className={`text-lg transition-colors ${isActive ? 'text-green' : 'text-text-3 group-hover:text-text-1'}`}>
                  {item.icon}
                </span>
                <span className="tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Utility / Notifications */}
      <div className="px-4 py-4 space-y-1">
        <button
          onClick={onNotifClick}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium
                     text-text-2 hover:text-white hover:bg-white/[0.03] transition-all group"
        >
          <div className="relative">
             <span className="text-lg text-text-3 group-hover:text-text-1 transition-colors">🔔</span>
             {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red"></span>
                </span>
             )}
          </div>
          <span>Notifications</span>
          {unread > 0 && (
             <span className="ml-auto text-[10px] font-bold text-red uppercase tracking-widest">{unread}</span>
          )}
        </button>
      </div>

      {/* User Module */}
      <div className="p-4 mt-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-inner shadow-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-bg-3 to-bg-2 border border-white/10
                            flex items-center justify-center text-[11px] font-bold
                            text-white flex-shrink-0 shadow-lg">
              {currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-white truncate leading-none mb-1.5">
                {currentUser?.name}
              </div>
              <Badge type={currentUser?.role} className="scale-90 origin-left">
                {currentUser?.role}
              </Badge>
            </div>
          </div>
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/useApp.jsx'
import Badge from '../ui/Badge.jsx'

const NAV = {
  admin: [
    { to: '/admin',             icon: '⊞', label: 'Dashboard'   },
    { to: '/admin/campaigns',   icon: '◈', label: 'Campaigns'   },
    { to: '/admin/submissions', icon: '⬆', label: 'Submissions' },
    { to: '/admin/evaluators',  icon: '⚖', label: 'Evaluators'  },
  ],
  evaluator: [
    { to: '/evaluator', icon: '⚖', label: 'My Queue' },
  ],
  submitter: [
    { to: '/submitter',     icon: '⬆', label: 'My Submissions' },
    { to: '/submitter/new', icon: '+', label: 'New Submission'  },
  ],
}

// ── Added onClose prop for mobile close button ────────────────────────────────
export default function Sidebar({ unread, onNotifClick, onClose }) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const items    = NAV[currentUser?.role] ?? []

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    onClose?.()
  }

  return (
    // ── Removed sticky (breaks inside fixed parent on mobile)
    // ── Removed z-50 (z-index managed by wrapper in MainLayout)
    <aside className="w-[260px] bg-bg-1 border-r border-white/5 flex flex-col
                      flex-shrink-0 h-full overflow-y-auto">

      {/* ── Brand Header ─────────────────────────────────────────────────── */}
      <div className="px-6 py-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green to-purple
                          flex items-center justify-center font-display font-bold
                          text-lg text-bg-0 flex-shrink-0 shadow-lg shadow-green/10
                          transition-transform group-hover:scale-110">
            S
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-base tracking-tight text-white leading-tight">
              ScoreFlow <span className="text-green">AI</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 mt-1
                            rounded bg-white/5 border border-white/5">
              <span className="w-1 h-1 rounded-full bg-green animate-pulse" />
              <span className="text-[9px] text-text-3 tracking-[0.15em] font-bold uppercase">
                System v1
              </span>
            </div>
          </div>
        </div>

        {/* ── Close button — mobile only ──────────────────────────────────── */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg
                     text-text-3 hover:text-white hover:bg-white/[0.06]
                     transition-all active:scale-90 text-xl leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 px-4 flex flex-col gap-1">
        <div className="text-[10px] text-text-3 font-bold uppercase
                        tracking-[0.2em] px-3 mb-2 opacity-50">
          Main Menu
        </div>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            // ── Close sidebar on mobile when a link is tapped
            onClick={handleNavClick}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl
               text-[13px] font-medium transition-all duration-200 group
               ${isActive
                 ? 'text-green bg-green/5 shadow-[inset_0_0_12px_rgba(0,212,170,0.02)]'
                 : 'text-text-2 hover:text-white hover:bg-white/[0.03]'}`
            }
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/useApp.jsx'
import Badge from '../ui/Badge.jsx'

const NAV = {
  admin: [
    { to: '/admin',             icon: '⊞', label: 'Dashboard'   },
    { to: '/admin/campaigns',   icon: '◈', label: 'Campaigns'   },
    { to: '/admin/submissions', icon: '⬆', label: 'Submissions' },
    { to: '/admin/evaluators',  icon: '⚖', label: 'Evaluators'  },
  ],
  evaluator: [
    { to: '/evaluator', icon: '⚖', label: 'My Queue' },
  ],
  submitter: [
    { to: '/submitter',     icon: '⬆', label: 'My Submissions' },
    { to: '/submitter/new', icon: '+', label: 'New Submission'  },
  ],
}

// ── Added onClose prop for mobile close button ────────────────────────────────
export default function Sidebar({ unread, onNotifClick, onClose }) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const items    = NAV[currentUser?.role] ?? []

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    onClose?.()
  }

  return (
    // ── Removed sticky (breaks inside fixed parent on mobile)
    // ── Removed z-50 (z-index managed by wrapper in MainLayout)
    <aside className="w-[260px] bg-bg-1 border-r border-white/5 flex flex-col
                      flex-shrink-0 h-full overflow-y-auto">

      {/* ── Brand Header ─────────────────────────────────────────────────── */}
      <div className="px-6 py-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green to-purple
                          flex items-center justify-center font-display font-bold
                          text-lg text-bg-0 flex-shrink-0 shadow-lg shadow-green/10
                          transition-transform group-hover:scale-110">
            S
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-base tracking-tight text-white leading-tight">
              ScoreFlow <span className="text-green">AI</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 mt-1
                            rounded bg-white/5 border border-white/5">
              <span className="w-1 h-1 rounded-full bg-green animate-pulse" />
              <span className="text-[9px] text-text-3 tracking-[0.15em] font-bold uppercase">
                System v1
              </span>
            </div>
          </div>
        </div>

        {/* ── Close button — mobile only ──────────────────────────────────── */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg
                     text-text-3 hover:text-white hover:bg-white/[0.06]
                     transition-all active:scale-90 text-xl leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 px-4 flex flex-col gap-1">
        <div className="text-[10px] text-text-3 font-bold uppercase
                        tracking-[0.2em] px-3 mb-2 opacity-50">
          Main Menu
        </div>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            // ── Close sidebar on mobile when a link is tapped
            onClick={handleNavClick}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl
               text-[13px] font-medium transition-all duration-200 group
               ${isActive
                 ? 'text-green bg-green/5 shadow-[inset_0_0_12px_rgba(0,212,170,0.02)]'
                 : 'text-text-2 hover:text-white hover:bg-white/[0.03]'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-green
                                  rounded-r-full shadow-[2px_0_8px_#00D4AA]" />
                )}
                <span className={`text-lg transition-colors
                  ${isActive ? 'text-green' : 'text-text-3 group-hover:text-text-1'}`}>
                  {item.icon}
                </span>
                <span className="tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Notifications ────────────────────────────────────────────────── */}
      <div className="px-4 py-4 space-y-1 flex-shrink-0">
        <button
          onClick={onNotifClick}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                     text-[13px] font-medium text-text-2 hover:text-white
                     hover:bg-white/[0.03] transition-all group"
        >
          <div className="relative">
            <span className="text-lg text-text-3 group-hover:text-text-1 transition-colors">
              🔔
            </span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full
                                 rounded-full bg-red opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red" />
              </span>
            )}
          </div>
          <span>Notifications</span>
          {unread > 0 && (
            <span className="ml-auto text-[10px] font-bold text-red
                             uppercase tracking-widest">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* ── User module ──────────────────────────────────────────────────── */}
      <div className="p-4 mt-auto flex-shrink-0">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4
                        shadow-inner shadow-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-bg-3 to-bg-2
                            border border-white/10 flex items-center justify-center
                            text-[11px] font-bold text-white flex-shrink-0 shadow-lg">
              {currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-white truncate
                              leading-none mb-1.5">
                {currentUser?.name}
              </div>
              <Badge type={currentUser?.role} className="scale-90 origin-left">
                {currentUser?.role}
              </Badge>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center justify-center gap-2
                       bg-white/5 border border-white/5 rounded-xl
                       text-text-3 text-[11px] font-bold uppercase tracking-widest
                       py-2.5 hover:bg-red/10 hover:text-red hover:border-red/20
                       transition-all active:scale-95"
          >
            <span>⎋</span>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
