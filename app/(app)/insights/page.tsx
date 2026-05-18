'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { computeInsights, getPosts } from '@/lib/services/data'
import type { ContentPost } from '@/lib/types'
import { formatNumber, formatPercent, formatHour, FORMAT_LABELS, HOOK_LABELS, PERFORMANCE_CONFIG } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

export default function InsightsPage() {
  const { profile } = useAuth()
  const [insights, setInsights] = useState<any>(null)
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([computeInsights(profile.id), getPosts(profile.id)]).then(([ins, p]) => {
      setInsights(ins)
      setPosts(p)
      setLoading(false)
    })
  }, [profile])

  if (loading) return <div style={{ color: 'var(--tt-muted)' }}>Crunching your data…</div>

  if (posts.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Insights 📊</h1>
        <div className="pp-card" style={{ padding: '60px', textAlign: 'center', borderStyle: 'dashed', marginTop: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Not enough data yet</h2>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px', marginBottom: '20px' }}>Log some posts and add metric snapshots to start seeing patterns</p>
          <Link href="/posts/new" className="pp-btn-primary">Log Your First Post</Link>
        </div>
      </div>
    )
  }

  // Build format comparison data
  const formatMap: Record<string, { total: number; count: number; views: number }> = {}
  posts.forEach(post => {
    if (!post.content_format) return
    const snap = [...(post.post_metric_snapshots ?? [])].sort((a,b) => (b.hours_since_post??0)-(a.hours_since_post??0))[0]
    if (!snap) return
    if (!formatMap[post.content_format]) formatMap[post.content_format] = { total: 0, count: 0, views: 0 }
    formatMap[post.content_format].total += snap.engagement_rate ?? 0
    formatMap[post.content_format].count++
    formatMap[post.content_format].views += snap.views
  })
  const formatData = Object.entries(formatMap).map(([k, v]) => ({
    name: FORMAT_LABELS[k] ?? k,
    avgEng: parseFloat((v.total / v.count).toFixed(2)),
    avgViews: Math.round(v.views / v.count)
  })).sort((a,b) => b.avgViews - a.avgViews)

  // Hook type data
  const hookMap: Record<string, { total: number; count: number }> = {}
  posts.forEach(post => {
    if (!post.hook_type) return
    const snap = [...(post.post_metric_snapshots ?? [])].sort((a,b) => (b.hours_since_post??0)-(a.hours_since_post??0))[0]
    if (!snap) return
    if (!hookMap[post.hook_type]) hookMap[post.hook_type] = { total: 0, count: 0 }
    hookMap[post.hook_type].total += snap.engagement_rate ?? 0
    hookMap[post.hook_type].count++
  })
  const hookData = Object.entries(hookMap).map(([k, v]) => ({
    name: HOOK_LABELS[k] ?? k,
    avgEng: parseFloat((v.total / v.count).toFixed(2))
  })).sort((a,b) => b.avgEng - a.avgEng)

  // Winner posts
  const winnerPosts = posts
    .filter(p => p.performance_rating === 'winner' || p.performance_rating === 'viral')
    .slice(0, 5)

  const avgViews = insights?.avgViews ?? 0

  return (
    <div>
      <div style={{ marginBottom: '28px' }} className="animate-fade-up">
        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Insights 📊</h1>
        <p style={{ color: 'var(--tt-muted)', fontSize: '14px' }}>Based on {posts.length} posts</p>
      </div>

      {/* Insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {insights?.bestPillar && (
          <div className="pp-card animate-fade-up" style={{ padding: '20px', borderColor: `${insights.bestPillar.color}40` }}>
            <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>🏆 Best Category</div>
            <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: insights.bestPillar.color, marginBottom: '4px' }}>
              {insights.bestPillar.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--tt-muted)' }}>
              {insights.bestPillar.avgEngagement.toFixed(1)}% avg engagement
            </div>
          </div>
        )}
        {insights?.bestFormat && (
          <div className="pp-card animate-fade-up animate-delay-1" style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>🎬 Best Format</div>
            <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '4px' }}>
              {FORMAT_LABELS[insights.bestFormat.format] ?? insights.bestFormat.format}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--tt-muted)' }}>
              {formatNumber(insights.bestFormat.avgViews)} avg views
            </div>
          </div>
        )}
        {insights?.topSaveRate && (
          <div className="pp-card animate-fade-up animate-delay-2" style={{ padding: '20px', borderColor: 'rgba(16,185,129,0.3)' }}>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>💾 Top Save Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#10b981', marginBottom: '4px' }}>
              {formatPercent(insights.topSaveRate.rate)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--tt-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {insights.topSaveRate.title}
            </div>
          </div>
        )}
        <div className="pp-card animate-fade-up animate-delay-1" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>📈 Avg Engagement</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '4px' }}>
            {insights?.avgEngagementRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tt-muted)' }}>Across all posts</div>
        </div>
        <div className="pp-card animate-fade-up animate-delay-2" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>👥 Followers Gained</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '4px' }}>
            +{formatNumber(insights?.totalFollowersGained ?? 0)}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tt-muted)' }}>From tracked posts</div>
        </div>
        <div className="pp-card animate-fade-up animate-delay-3" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>🏆 Winner Posts</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '4px' }}>
            {insights?.winnerPosts.length ?? 0}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--tt-muted)' }}>2x+ average views</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Format comparison */}
        {formatData.length > 0 && (
          <div className="pp-card animate-fade-up" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>Format Performance (Avg Views)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formatData} layout="vertical">
                <XAxis type="number" stroke="#7070a0" tick={{ fontSize: 10 }} tickFormatter={v => formatNumber(v)} />
                <YAxis type="category" dataKey="name" stroke="#7070a0" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0f5', fontSize: '12px' }} />
                <Bar dataKey="avgViews" fill="#fe2c55" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Hook type comparison */}
        {hookData.length > 0 && (
          <div className="pp-card animate-fade-up animate-delay-1" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>Hook Type (Avg Engagement %)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hookData} layout="vertical">
                <XAxis type="number" stroke="#7070a0" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" stroke="#7070a0" tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0f5', fontSize: '12px' }} />
                <Bar dataKey="avgEng" fill="#25f4ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Best posting hours */}
      {insights?.bestPostingHours?.length > 0 && (
        <div className="pp-card animate-fade-up" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>⏰ Best Posting Times</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            {insights.bestPostingHours.map((h: { hour: number; avgViews: number }, i: number) => (
              <div key={h.hour} style={{ padding: '16px 24px', background: 'var(--tt-dark)', borderRadius: '12px', textAlign: 'center', border: `1px solid ${i === 0 ? 'rgba(254,44,85,0.4)' : 'var(--tt-border)'}` }}>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: i === 0 ? '#fe2c55' : 'var(--tt-text)' }}>{formatHour(h.hour)}</div>
                <div style={{ fontSize: '12px', color: 'var(--tt-muted)', marginTop: '4px' }}>{formatNumber(h.avgViews)} avg views</div>
                {i === 0 && <div style={{ fontSize: '10px', color: '#fe2c55', fontWeight: 700, marginTop: '4px' }}>BEST</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winner posts */}
      {winnerPosts.length > 0 && (
        <div className="pp-card animate-fade-up" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>🏆 Winner Posts — Study These</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {winnerPosts.map(post => {
              const snap = [...(post.post_metric_snapshots ?? [])].sort((a,b) => (b.hours_since_post??0)-(a.hours_since_post??0))[0]
              const perf = post.performance_rating ? PERFORMANCE_CONFIG[post.performance_rating] : null
              return (
                <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: 'var(--tt-dark)', borderRadius: '10px', border: '1px solid rgba(254,44,85,0.2)' }}>
                  <span style={{ fontSize: '20px' }}>{perf?.emoji ?? '🏆'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                    {post.hook_text && <div style={{ fontSize: '12px', color: 'var(--tt-muted)', fontStyle: 'italic', marginTop: '2px' }}>"{post.hook_text}"</div>}
                  </div>
                  {snap && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fe2c55' }}>{formatNumber(snap.views)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--tt-muted)' }}>views</div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Actionable insight */}
      {avgViews > 0 && (
        <div className="pp-card animate-fade-up" style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, var(--tt-card) 0%, rgba(37,244,238,0.05) 100%)', borderColor: 'rgba(37,244,238,0.2)' }}>
          <div style={{ fontSize: '11px', color: '#25f4ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>💡 What to do next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights?.bestPillar && (
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                → Post more <strong style={{ color: insights.bestPillar.color }}>{insights.bestPillar.name}</strong> content — it's your highest-engagement category.
              </p>
            )}
            {insights?.bestPostingHours?.[0] && (
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                → Your best posting time is <strong style={{ color: '#fe2c55' }}>{formatHour(insights.bestPostingHours[0].hour)}</strong>. Schedule your next video for then.
              </p>
            )}
            {winnerPosts[0] && (
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                → <Link href={`/posts/${winnerPosts[0].id}`} style={{ color: '#fe2c55', textDecoration: 'none', fontWeight: 600 }}>{winnerPosts[0].title}</Link> is a winner. Consider making a follow-up.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
