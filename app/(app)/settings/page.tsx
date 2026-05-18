'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { updateProfile, getPillars, createPillar } from '@/lib/services/data'
import type { ContentPillar } from '@/lib/types'
import { PILLAR_COLORS } from '@/lib/utils'

export default function SettingsPage() {
  const { profile, patchProfile } = useAuth()
  const [pillars, setPillars] = useState<ContentPillar[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPillar, setNewPillar] = useState('')
  const [newPillarColor, setNewPillarColor] = useState(PILLAR_COLORS[0])

  const [form, setForm] = useState({
    display_name: '',
    niche: '',
    bio: '',
    target_audience: '',
    current_follower_count: '',
    primary_goal: '',
  })

  useEffect(() => {
    if (!profile) return
    setForm({
      display_name: profile.display_name ?? '',
      niche: profile.niche ?? '',
      bio: profile.bio ?? '',
      target_audience: profile.target_audience ?? '',
      current_follower_count: profile.current_follower_count?.toString() ?? '0',
      primary_goal: profile.primary_goal ?? '',
    })
    getPillars(profile.id).then(setPillars)
  }, [profile])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const updated = await updateProfile(profile.id, {
      display_name: form.display_name,
      niche: form.niche || undefined,
      bio: form.bio || undefined,
      target_audience: form.target_audience || undefined,
      current_follower_count: parseInt(form.current_follower_count) || 0,
      primary_goal: (form.primary_goal || undefined) as any,
    })
    setSaving(false)
    if (updated) {
      patchProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const handleAddPillar = async () => {
    if (!profile || !newPillar.trim()) return
    const p = await createPillar(profile.id, newPillar.trim(), newPillarColor)
    if (p) {
      setPillars(prev => [...prev, p])
      setNewPillar('')
      setNewPillarColor(PILLAR_COLORS[(pillars.length + 1) % PILLAR_COLORS.length])
    }
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '28px' }} className="animate-fade-up">
        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Settings ⚙️</h1>
        <p style={{ color: 'var(--tt-muted)', fontSize: '14px' }}>Manage your creator profile and categories</p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSave}>
        <div className="pp-card animate-fade-up animate-delay-1" style={{ padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px' }}>Creator Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="pp-label">Display Name</label>
              <input className="pp-input" value={form.display_name} onChange={set('display_name')} placeholder="Your creator name" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="pp-label">Niche</label>
                <input className="pp-input" value={form.niche} onChange={set('niche')} placeholder="e.g. Mom life, Fashion, Fitness" />
              </div>
              <div>
                <label className="pp-label">Current Followers</label>
                <input className="pp-input" type="number" value={form.current_follower_count} onChange={set('current_follower_count')} placeholder="e.g. 1200" min="0" />
              </div>
            </div>
            <div>
              <label className="pp-label">Target Audience</label>
              <input className="pp-input" value={form.target_audience} onChange={set('target_audience')} placeholder="Who is your content for?" />
            </div>
            <div>
              <label className="pp-label">Bio / About</label>
              <textarea className="pp-input" value={form.bio} onChange={set('bio')} placeholder="Brief description of your content" style={{ minHeight: '70px' }} />
            </div>
            <div>
              <label className="pp-label">Primary Goal</label>
              <select className="pp-input" value={form.primary_goal} onChange={set('primary_goal')}>
                <option value="">— Select a goal —</option>
                <option value="grow_followers">Grow Followers</option>
                <option value="increase_engagement">Increase Engagement</option>
                <option value="drive_sales">Drive Sales</option>
                <option value="get_brand_deals">Get Brand Deals</option>
                <option value="build_community">Build Community</option>
              </select>
            </div>

            <button type="submit" className="pp-btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>

      {/* Content Pillars */}
      <div className="pp-card animate-fade-up animate-delay-2" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '6px' }}>Content Pillars</h2>
        <p style={{ color: 'var(--tt-muted)', fontSize: '13px', marginBottom: '20px' }}>These are your main content categories — used to track what performs best</p>

        {/* Existing pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {pillars.length === 0 ? (
            <p style={{ color: 'var(--tt-muted)', fontSize: '13px', fontStyle: 'italic' }}>No pillars yet — add some below</p>
          ) : pillars.map(pillar => (
            <div key={pillar.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--tt-dark)', borderRadius: '10px', border: `1px solid ${pillar.color}30` }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: pillar.color, flexShrink: 0 }} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{pillar.name}</span>
            </div>
          ))}
        </div>

        {/* Add new pillar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="pp-label">New Pillar Name</label>
            <input className="pp-input" value={newPillar} onChange={e => setNewPillar(e.target.value)} placeholder="e.g. Mom Life, Fashion, Fitness…"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPillar() } }} />
          </div>
          <div>
            <label className="pp-label">Color</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {PILLAR_COLORS.slice(0, 5).map(c => (
                <button key={c} type="button" onClick={() => setNewPillarColor(c)}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: `2px solid ${newPillarColor === c ? 'white' : 'transparent'}`, cursor: 'pointer', flexShrink: 0 }} />
              ))}
            </div>
          </div>
          <button type="button" onClick={handleAddPillar} className="pp-btn-primary" style={{ flexShrink: 0 }}>+ Add</button>
        </div>

        {/* Suggestions */}
        {pillars.length === 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--tt-muted)', marginBottom: '8px' }}>Quick add:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Lifestyle', 'Mom Life', 'Fashion', 'Cleaning', 'Fitness', 'Humor', 'Storytime', 'Shopping'].map((s, i) => (
                <button key={s} type="button"
                  onClick={async () => {
                    if (!profile) return
                    const p = await createPillar(profile.id, s, PILLAR_COLORS[i % PILLAR_COLORS.length])
                    if (p) setPillars(prev => [...prev, p])
                  }}
                  style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--tt-border)', background: 'var(--tt-card2)', color: 'var(--tt-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
