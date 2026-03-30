import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/useApp.jsx'
import { authAPI } from '../../lib/api.jsx'
import Button from '../../components/ui/Button.jsx'
import Input  from '../../components/ui/Input.jsx'
import Card   from '../../components/ui/Card.jsx'

const ROLE_PATHS   = { admin: '/admin', evaluator: '/evaluator', submitter: '/submitter' }
const ROLE_OPTIONS = [
  { value: 'submitter', label: 'Submitter — apply to campaigns' },
  { value: 'evaluator', label: 'Evaluator — score entries' },
  { value: 'admin',     label: 'Admin — manage campaigns' },
]

export default function Register() {
  const { login }   = useApp()
  const navigate    = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'submitter' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const validate = () => {
    if (!form.name.trim())             return 'Full name is required'
    if (!form.email.trim())            return 'Email is required'
    if (form.password.length < 6)      return 'Password must be at least 6 characters'
    return null
  }

  const handle = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      await authAPI.register(form)
      const user = await login(form.email, form.password)
      navigate(ROLE_PATHS[user.role] ?? '/')
    } catch (e) {
      setError(e.response?.data?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-0 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] fade-up z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block group mb-6">
             <div className="absolute -inset-1.5 bg-gradient-to-br from-green to-purple rounded-[18px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative w-14 h-14 bg-gradient-to-br from-green to-purple
                            rounded-[16px] flex items-center justify-center
                            font-display font-extrabold text-[28px] text-bg-0 shadow-xl">
              S
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight text-white">
            Join ScoreFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-green to-emerald-400">AI</span>
          </h1>
          <p className="text-text-3 text-sm mt-2">Get started by creating your secure account.</p>
        </div>

        <Card className="backdrop-blur-xl border-white/5 shadow-2xl">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4">
              <Input label="Full Name" value={form.name}
                onChange={v => set('name', v)}
                placeholder="e.g. Alex Rivera" required />

              <Input label="Email Address" value={form.email}
                onChange={v => set('email', v)}
                type="email" placeholder="alex@company.com" required />

              <Input label="Secure Password" value={form.password}
                onChange={v => set('password', v)}
                type="password" placeholder="••••••••" required />

              <Input
                as="select" label="Platform Role" value={form.role}
                onChange={v => set('role', v)}
                options={ROLE_OPTIONS}
              />
            </div>

            {/* Refined Role Guide */}
            <div className="bg-bg-3/50 border border-white/5 rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green/40" />
              <div className="text-[10px] text-green font-bold uppercase tracking-[0.15em] mb-2 px-1">
                Access Guide
              </div>
              <div className="space-y-2 px-1">
                <p className="text-[11px] text-text-2 leading-relaxed">
                  <strong className="text-white">Submitter:</strong> Apply to open campaigns and track entries.
                </p>
                <p className="text-[11px] text-text-2 leading-relaxed">
                  <strong className="text-white">Evaluator:</strong> Access scoring rubrics and review submissions.
                </p>
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
              onClick={handle} disabled={loading}
              className="w-full py-6 font-bold shadow-lg shadow-green/10"
            >
              {loading ? 'Processing...' : 'Create My Account →'}
            </Button>

            <p className="text-center text-sm text-text-3 mt-2">
              Already using ScoreFlow?{' '}
              <Link to="/login" className="text-white font-semibold hover:text-green transition-colors underline-offset-4 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-8 text-center text-[10px] text-text-3/40 tracking-[0.2em] uppercase font-bold">
          Encrypted • ISO 27001 Compliant • 2026
        </p>
      </div>
    </div>
  )
}