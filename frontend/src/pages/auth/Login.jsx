import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/useApp.jsx'
import Button from '../../components/ui/Button.jsx'
import Input  from '../../components/ui/Input.jsx'
import Card   from '../../components/ui/Card.jsx'

const ROLE_PATHS = { admin: '/admin', evaluator: '/evaluator', submitter: '/submitter' }

export default function Login() {
  const { login }   = useApp()
  const navigate    = useNavigate()
  const [email,  setEmail]   = useState('')
  const [pass,   setPass]    = useState('')
  const [error,  setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!email || !pass) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      const user = await login(email, pass)
      navigate(ROLE_PATHS[user.role] ?? '/')
    } catch (e) {
      setError(e.response?.data?.message ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-0 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[400px] fade-up z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="relative inline-block group mb-6">
             <div className="absolute -inset-1.5 bg-gradient-to-br from-green to-purple rounded-[18px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative w-14 h-14 bg-gradient-to-br from-green to-purple
                            rounded-[16px] flex items-center justify-center
                            font-display font-extrabold text-[28px] text-bg-0 shadow-xl">
              S
            </div>
          </div>
          
          <h1 className="font-display font-bold text-3xl tracking-tight text-white">
            ScoreFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-green to-emerald-400">AI</span>
          </h1>
          <p className="text-text-3 text-sm mt-2 font-medium">Welcome back. Enter your credentials to sync.</p>
        </div>

        <Card className="backdrop-blur-xl border-white/5 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <Input 
                label="Email Address" 
                value={email} 
                onChange={setEmail}
                type="email" 
                placeholder="name@company.com" 
                required 
              />
              <div className="space-y-1">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] text-text-3 tracking-[0.08em] uppercase font-bold">Password</label>
                  <Link to="/forgot" className="text-[10px] text-green/70 hover:text-green transition-colors font-bold uppercase tracking-wider">Forgot?</Link>
                </div>
                <Input 
                  value={pass} 
                  onChange={setPass}
                  type="password" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20
                              rounded-xl px-4 py-3 flex items-center gap-2 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <Button
              onClick={handle} 
              disabled={loading}
              className="w-full py-6 text-sm font-bold shadow-lg shadow-green/10"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Sign in to Dashboard →'
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] text-text-3 font-bold">
                <span className="bg-bg-2 px-4">Access Control</span>
              </div>
            </div>

            <p className="text-center text-sm text-text-3">
              New to the platform?{' '}
              <Link to="/register" className="text-white font-semibold hover:text-green transition-colors underline-offset-4 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-10 text-center text-[10px] text-text-3/40 tracking-widest uppercase font-bold">
          Protected by ScoreFlow Identity Engine
        </p>
      </div>
    </div>
  )
}