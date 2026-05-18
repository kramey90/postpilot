'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tt-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(254,44,85,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--tt-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✈️</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800 }} className="gradient-text">PostPilot</span>
          </div>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px' }}>Plan it. Post it. Learn what works.</p>
        </div>
        <div className="pp-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', background: 'var(--tt-dark)', borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: mode === m ? 'var(--tt-red)' : 'transparent', color: mode === m ? 'white' : 'var(--tt-muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div>
                <label className="pp-label">Your Name</label>
                <input className="pp-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah" required />
              </div>
            )}
            <div>
              <label className="pp-label">Email</label>
              <input className="pp-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="pp-label">Password</label>
              <input className="pp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div style={{ padding: '10px 14px', background: 'rgba(254,44,85,0.1)', border: '1px solid rgba(254,44,85,0.3)', borderRadius: '8px', fontSize: '13px', color: '#fe2c55' }}>{error}</div>}
            {success && <div style={{ padding: '10px 14px', background: 'rgba(37,244,238,0.1)', border: '1px solid rgba(37,244,238,0.3)', borderRadius: '8px', fontSize: '13px', color: '#25f4ee' }}>{success}</div>}
            <button type="submit" className="pp-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} disabled={loading}>
              {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--tt-muted)' }}>Built for creators who want to grow smarter 🎯</p>
      </div>
    </div>
  )
}
