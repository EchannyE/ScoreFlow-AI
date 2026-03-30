import { useState, useEffect, useCallback } from 'react'
import { notificationsAPI } from '../lib/api.jsx'
 
export function useNotifications(currentUser) {
  const [notifications, setNotifications] = useState([])
 
  useEffect(() => {
    if (!currentUser) return
    notificationsAPI.list().then(({ data }) => setNotifications(data))
  }, [currentUser])
 
  const markRead = useCallback(async id => {
    await notificationsAPI.markRead(id)
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    )
  }, [])
 
  const unread = notifications.filter(n => !n.read).length
 
  return { notifications, unread, markRead }
}
 