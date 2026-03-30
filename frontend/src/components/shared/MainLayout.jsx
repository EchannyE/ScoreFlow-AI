import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar            from './Sidebar.jsx'
import NotificationDrawer from './NotificationDrawer.jsx'
import { useApp }         from '../../context/useApp.jsx'
import { useNotifications } from '../../hooks/useNotification.js'

export default function MainLayout() {
  const { currentUser } = useApp()
  const { notifications, unread, markRead } = useNotifications(currentUser)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeAll = () => {
    setNotifOpen(false)
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-bg-0 selection:bg-green/20">

      {/* ── Sidebar overlay backdrop (mobile only) ───────────────────────── */}
      <div
        className={`
          fixed inset-0 z-40 bg-bg-0/70 backdrop-blur-sm
          transition-opacity duration-300 lg:hidden
          ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      {/*
        Desktop: always visible, static in flow
        Mobile:  fixed, slides in from left, sits above content
      */}
      <div className={`
        fixed top-0 left-0 h-full z-50
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          unread={unread}
          onNotifClick={() => { setNotifOpen(p => !p); setSidebarOpen(false) }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 relative flex flex-col min-w-0 h-screen overflow-hidden
                       lg:ml-0">

        {/* Mobile top bar — hamburger + logo + notification bell */}
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-border bg-bg-1 lg:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5
                       rounded-lg hover:bg-bg-3 transition-colors"
            aria-label="Open menu"
          >
            <span className="w-5 h-px bg-text-1 block" />
            <span className="w-5 h-px bg-text-1 block" />
            <span className="w-3 h-px bg-text-1 block self-start ml-1" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green to-purple
                            flex items-center justify-center font-display font-bold
                            text-xs text-bg-0">
              S
            </div>
            <span className="font-display font-bold text-sm">
              ScoreFlow <span className="text-green">AI</span>
            </span>
          </div>

          <button
            onClick={() => setNotifOpen(p => !p)}
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       hover:bg-bg-3 transition-colors relative"
            aria-label="Notifications"
          >
            <span className="text-base">🔔</span>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red rounded-full
                               flex items-center justify-center text-[9px]
                               font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>

        {/* Depth gradient */}
        <div className="absolute top-0 left-0 right-0 h-32
                        bg-gradient-to-b from-green/5 to-transparent
                        pointer-events-none z-0" />

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-[1600px] mx-auto
                          p-4 sm:p-6 lg:p-8 xl:p-12">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ── Notification drawer ───────────────────────────────────────────── */}
      <div className={`
        fixed inset-0 z-[100] transition-all duration-500
        ${notifOpen ? 'visible' : 'invisible pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div
          className={`
            absolute inset-0 bg-bg-0/60 backdrop-blur-sm
            transition-opacity duration-500
            ${notifOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setNotifOpen(false)}
        />

        {/* Drawer */}
        <div className={`
          absolute top-0 right-0 h-full
          w-full sm:max-w-[400px]
          transform transition-transform duration-500
          ${notifOpen ? 'translate-x-0 shadow-[-20px_0_80px_rgba(0,0,0,0.4)]' : 'translate-x-full'}
        `}>
          <NotificationDrawer
            notifications={notifications}
            onMarkRead={markRead}
            onClose={() => setNotifOpen(false)}
          />
        </div>
      </div>

    </div>
  )
}
