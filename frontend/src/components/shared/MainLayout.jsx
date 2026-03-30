import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar             from './Sidebar.jsx'
import NotificationDrawer  from './NotificationDrawer.jsx'
import { useApp }          from '../../context/useApp.jsx'
import { useNotifications } from '../../hooks/useNotification.js'

export default function MainLayout() {
  const { currentUser } = useApp()
  const { notifications, unread, markRead } = useNotifications(currentUser)
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg-0 selection:bg-green/20">
      {/* Sidebar - Fixed or Sticky depending on your Sidebar implementation */}
      <Sidebar 
        unread={unread} 
        onNotifClick={() => setOpen(p => !p)} 
        isDrawerOpen={open}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Subtle top-gradient for depth */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green/5 to-transparent pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <div className="max-w-[1600px] mx-auto p-8 lg:p-10 xl:p-12">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Notification Drawer - Handled with an Overlay transition */}
      <div className={`
        fixed inset-0 z-[100] transition-all duration-500 ease-in-out
        ${open ? 'visible' : 'invisible pointer-events-none'}
      `}>
        {/* Backdrop blur */}
        <div 
          className={`
            absolute inset-0 bg-bg-0/60 backdrop-blur-sm transition-opacity duration-500
            ${open ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setOpen(false)}
        />

        {/* Drawer Component Wrapper */}
        <div className={`
          absolute top-0 right-0 h-full w-full max-w-[400px] 
          transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
          ${open ? 'translate-x-0 shadow-[-20px_0_80px_rgba(0,0,0,0.4)]' : 'translate-x-full'}
        `}>
          <NotificationDrawer
            notifications={notifications}
            onMarkRead={markRead}
            onClose={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}