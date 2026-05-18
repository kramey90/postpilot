'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPost, addSnapshot, updatePost } from '@/lib/services/data'
import type { ContentPost, SnapshotLabel } from '@/lib/types'
import { formatNumber, formatPercent, PERFORMANCE_CONFIG, FORMAT_LABELS, HOOK_LABELS } from '@/lib/utils'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const SNAPSHOT_LABELS: SnapshotLabel[] = ['1h', '3h', '24h', '48h', '7d', '30d']
const SNAPSHOT_NAMES: Record<SnapshotLabel, string> = { '1h': '1 Hour', '3h': '3 Hours', '24h': '24 Hours', '48h': '48 Hours', '7d': '7 Days', '30d': '30 Days' }

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<ContentPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSnapshot, setActiveSnapshot] = useState<SnapshotLabel | null>(null)
  const [snapshotForm, setSnapshotForm] = useState({ views: '', likes: '', comments: '', shares: '', saves: '', follows_gained: '', profile_views: '' })
  const [saving, setSaving] = useState(false)
  const [editPerf, setEditPerf] = useState(false)
  const [perfRating, setPerfRating] = useState('')

  const load = async () => {
    const p = await getPost(id)
    setPost(p)
    if (p?.performance_rating) setPerfRating(p.performance_rating)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleSnapshotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !activeSnapshot) return
    setSaving(true)
    const snap = await addSnapshot(post.id, activeSnapshot, {
      views: parseInt(snapshotForm.views) || 0,
      likes: parseInt(snapshotForm.likes) || 0,
      comments: parseInt(snapshotForm.comments) || 0,
      shares: parseInt(snapshotForm.shares) || 0,
      saves: parseInt(snapshotForm.saves) || 0,
      follows_gained: parseInt(snapshotForm.follows_gained) || 0,
      profile_views: parseInt(snapshotForm.profile_views) || 0,
    })
    setSaving(false)
    if (snap) {
      setActiveSnapshot(null)
      setSnapshotForm({ views: '', likes: '', comments: '', shares: '', saves: '', follows_gained: '', profile_views: '' })
      load()
    }
  }

  const handlePerfSave = async () => {
    if (!post || !perfRating) return
    await updatePost(post.id, { performance_rating: perfRating as any })
    setEditPerf(false)
    load()
  }

  if (loading) return <div style={{ color: 'var(--tt-muted)' }}>Loading…</div>
  if (!post) return <div>Post not found</div>

  const snapshots = [...(post.post_metric_snapshots ?? [])].sort((a, b) => (a.hours_since_post ?? 0) - (b.hours_since_post ?? 0))
  const latest = snapshots[snapshots.length - 1]
  const existingLabels = new Set(snapshots.map(s => s.snapshot_label))
  const chartData = snapshots.map(s => ({ name: s.snapshot_label, views: s.views, engagement: parseFloat((s.engagement_rate ?? 0).toFixed(2)), saves: s.saves }))
  const perf = post.performance_rating ? PERFORMANCE_CONFIG[post.performance_rating] : null

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Back */}
      <Link href="/posts" style={{ color: 'var(--tt-muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>← Post Journal</Link>

      {/* Header */}
      <div className="post-detail-header animate-fade-up">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '24px' }}>{post.title}</h1>
            {perf && <span style={{ fontSize: '20px' }}>{perf.emoji}</span>}
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: 'var(--tt-muted)' }}>
            <span>{format(new Date(post.posted_at), 'MMM d, yyyy · h:mm a')}</span>
            {post.content_format && <span>{FORMAT_LABELS[post.content_format]}</span>}
            {post.video_duration_seconds && <span>{post.video_duration_seconds}s</span>}
            {post.content_pillars && <span style={{ color: post.content_pillars.color }}>● {post.content_pillars.name}</span>}
          </div>
        </div>
        {post.post_url && (
          <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="pp-btn-secondary" style={{ fontSize: '13px', flexShrink: 0 }}>
            View on TikTok ↗
          </a>
        )}
      </div>

      <div className="post-detail-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Latest metrics */}
          {latest && (
            <div className="pp-card animate-fade-up" style={{ padding: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                Latest Stats · {SNAPSHOT_NAMES[latest.snapshot_label as SnapshotLabel]}
              </div>
              <div className="post-metrics-grid">
                {[
                  { label: 'Views', value: formatNumber(latest.views), color: '#25f4ee' },
                  { label: 'Likes', value: formatNumber(latest.likes), color: '#fe2c55' },
                  { label: 'Comments', value: formatNumber(latest.comments), color: '#8b5cf6' },
                  { label: 'Shares', value: formatNumber(latest.shares), color: '#f59e0b' },
                  { label: 'Saves', value: formatNumber(latest.saves), color: '#10b981' },
                  { label: 'Follows', value: formatNumber(latest.follows_gained), color: '#3b82f6' },
                  { label: 'Engagement', value: formatPercent(latest.engagement_rate ?? 0), color: '#ec4899' },
                  { label: 'Save Rate', value: formatPercent(latest.save_rate ?? 0), color: '#06b6d4' },
                ].map(m => (
                  <div key={m.label} style={{ padding: '12px', background: 'var(--tt-dark)', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--tt-muted)', marginTop: '2px' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="pp-card animate-fade-up animate-delay-1" style={{ padding: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', fontFamily: 'Syne, sans-serif' }}>View Growth Over Time</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#7070a0" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#7070a0" tick={{ fontSize: 11 }} tickFormatter={v => formatNumber(v)} />
                  <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0f5' }} />
                  <Line type="monotone" dataKey="views" stroke="#fe2c55" strokeWidth={2} dot={{ fill: '#fe2c55', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Snapshot tracker */}
          <div className="pp-card animate-fade-up animate-delay-2" style={{ padding: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', fontFamily: 'Syne, sans-serif' }}>📸 Add Metric Snapshot</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {SNAPSHOT_LABELS.map(label => (
                <button key={label} onClick={() => setActiveSnapshot(activeSnapshot === label ? null : label)}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'Syne, sans-serif', transition: 'all 0.2s',
                    background: activeSnapshot === label ? 'var(--tt-red)' : existingLabels.has(label) ? 'rgba(37,244,238,0.1)' : 'var(--tt-card2)',
                    borderColor: activeSnapshot === label ? 'var(--tt-red)' : existingLabels.has(label) ? 'rgba(37,244,238,0.4)' : 'var(--tt-border)',
                    color: activeSnapshot === label ? 'white' : existingLabels.has(label) ? '#25f4ee' : 'var(--tt-muted)' }}>
                  {existingLabels.has(label) && activeSnapshot !== label ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>

            {activeSnapshot && (
              <form onSubmit={handleSnapshotSubmit}>
                <div style={{ background: 'var(--tt-dark)', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--tt-red)', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {SNAPSHOT_NAMES[activeSnapshot]} Snapshot
                  </div>
                  <div className="post-snapshot-grid">
                    {[
                      { k: 'views', placeholder: 'Views' },
                      { k: 'likes', placeholder: 'Likes' },
                      { k: 'comments', placeholder: 'Comments' },
                      { k: 'shares', placeholder: 'Shares' },
                      { k: 'saves', placeholder: 'Saves' },
                      { k: 'follows_gained', placeholder: 'Follows Gained' },
                    ].map(({ k, placeholder }) => (
                      <div key={k}>
                        <input className="pp-input" type="number" min="0" placeholder={placeholder}
                          value={snapshotForm[k as keyof typeof snapshotForm]}
                          onChange={e => setSnapshotForm(f => ({ ...f, [k]: e.target.value }))}
                          style={{ fontSize: '13px', padding: '8px 10px' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="pp-btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
                  {saving ? 'Saving…' : `Save ${activeSnapshot} Snapshot`}
                </button>
              </form>
            )}
          </div>

          {/* Lesson learned */}
          {post.lesson_learned && (
            <div className="pp-card animate-fade-up animate-delay-3" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>💬 Lesson Learned</div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--tt-text)' }}>{post.lesson_learned}</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Post details */}
          <div className="pp-card animate-fade-up" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px', fontFamily: 'Syne, sans-serif' }}>Post Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Format', value: post.content_format ? FORMAT_LABELS[post.content_format] : null },
                { label: 'Hook Type', value: post.hook_type ? HOOK_LABELS[post.hook_type] : null },
                { label: 'CTA', value: post.cta_type !== 'none' ? post.cta_type?.replace('_', ' ') : null },
                { label: 'Trending Sound', value: post.used_trending_sound ? 'Yes' : 'No' },
                { label: 'Sound', value: post.sound_name },
                { label: 'Confidence', value: post.creator_confidence_score ? `${post.creator_confidence_score}/10` : null },
              ].filter(item => item.value).map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--tt-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hook */}
          {post.hook_text && (
            <div className="pp-card animate-fade-up animate-delay-1" style={{ padding: '20px', borderColor: 'rgba(37,244,238,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#25f4ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>🎣 Opening Hook</div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--tt-text)' }}>"{post.hook_text}"</p>
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="pp-card animate-fade-up animate-delay-2" style={{ padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Caption</div>
              <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--tt-muted)' }}>{post.caption}</p>
            </div>
          )}

          {/* Performance rating */}
          <div className="pp-card animate-fade-up animate-delay-3" style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Performance Rating</div>
            {editPerf ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select className="pp-input" value={perfRating} onChange={e => setPerfRating(e.target.value)} style={{ fontSize: '13px' }}>
                  <option value="">— Rate this post —</option>
                  {Object.entries(PERFORMANCE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePerfSave} className="pp-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '7px 12px' }}>Save</button>
                  <button onClick={() => setEditPerf(false)} className="pp-btn-secondary" style={{ fontSize: '12px', padding: '7px 12px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {perf ? (
                  <span style={{ fontSize: '16px' }}>{perf.emoji} <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: perf.color }}>{perf.label}</span></span>
                ) : (
                  <span style={{ color: 'var(--tt-muted)', fontSize: '13px' }}>Not rated yet</span>
                )}
                <button onClick={() => setEditPerf(true)} style={{ fontSize: '11px', color: 'var(--tt-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  {perf ? 'Change' : 'Rate it'}
                </button>
              </div>
            )}
          </div>

          {/* All snapshots summary */}
          {snapshots.length > 0 && (
            <div className="pp-card animate-fade-up animate-delay-4" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', fontFamily: 'Syne, sans-serif' }}>Snapshot History</div>
              {snapshots.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--tt-border)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--tt-muted)', fontWeight: 700 }}>{s.snapshot_label}</span>
                  <span>{formatNumber(s.views)} views · {(s.engagement_rate ?? 0).toFixed(1)}% eng.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
