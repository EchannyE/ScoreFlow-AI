import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../lib/api.jsx'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('sf_token')))

  useEffect(() => {
    const token = localStorage.getItem('sf_token')
    if (!token) {
      setLoading(false)
      return
    }

    authAPI.me()
      .then((response) => {
        const payload = response?.data
        const user =
          payload?.data?.user ??
          payload?.user ??
          payload?.data ??
          null

        setCurrentUser(user)
      })
      .catch(() => {
        localStorage.removeItem('sf_token')
        setCurrentUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password })
    const payload = response?.data

    const token =
      payload?.data?.token ??
      payload?.token ??
      null

    const user =
      payload?.data?.user ??
      payload?.user ??
      null

    if (!token || !user) {
      throw new Error('Invalid login response')
    }

    localStorage.setItem('sf_token', token)
    setCurrentUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sf_token')
    setCurrentUser(null)
  }, [])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#080C14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #00D4AA',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin .8s linear infinite',
          }}
        />
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AppContext.Provider>
  )
}
