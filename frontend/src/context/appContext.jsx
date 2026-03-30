import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../lib/api.jsx'
 
export const AppContext = createContext(null)
 
export function AppProvider({ children }) {
  const hasStoredToken = Boolean(localStorage.getItem('sf_token'))
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(hasStoredToken)
 
  useEffect(() => {
    if (!hasStoredToken) return

    authAPI.me()
      .then(r => setCurrentUser(r.data.user))
      .catch(() => localStorage.removeItem('sf_token'))
      .finally(() => setLoading(false))
  }, [hasStoredToken])
 
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('sf_token', data.token)
    setCurrentUser(data.user)
    return data.user
  }, [])
 
  const logout = useCallback(() => {
    localStorage.removeItem('sf_token')
    setCurrentUser(null)
  }, [])
 
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080C14', display: 'flex',
                  alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #00D4AA',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin .8s linear infinite' }} />
    </div>
  )
 
  return (
    <AppContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AppContext.Provider>
  )
}
 
 