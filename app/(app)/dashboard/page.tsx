'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { getPosts, getIdeas, computeInsights } from '@/lib/services/data'
import type { ContentPost, ContentIdea } from '@/lib/types'
import { formatNumber, PERFORMANCE_CONFIG } from '@/lib/utils'
import { format, subDays, isAfter } from 'date-fns'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      getPosts(profile.id),
      getIdeas(profile.id),
      computeInsights(profile.id)
    ]).then(([p, i, ins]) => {
      setPosts(p)
      setIdeas(i)
      setInsights(ins)
      setLoading(false)
    })
  }, [profile])

  if (!profile) return null

  const recentPosts = posts.slice(0, 5)
  const thisWeekPosts = posts.filter(p => isAfter(new Date(p.posted_at), subDays(new Date(), 7)))
  const readyIdeas = ideas.filter(i => i.status === 'ready_to_post')
  const draftIdeas = ideas.filter(i => ['idea','planned','scripted'].includes(i.status))

  // Get best post (most views)
  const bestPost = posts.reduce<ContentPost | null>((best, post) => {
    const snapshots = post.post_metric_snapshots ?? []
    const views = Math.max(0, ...snapshots.map(s => s.views))
    const bestViews = best ? Math.max(0, ...(best.post_metric_snapshots ?? []).map(s => s.views)) : 0
    return views > bestViews ? post : best
  }, null)

  const totalFollowers = profile.current_follower_count

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }} className="animate-fade-up">
        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>
          Hey {profile.display_name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--tt-muted)', fontSize: '15px' }}>Here's your creator overview</p>
      </div>

      {/* Top stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Followers', value: formatNumber(totalFollowers), icon: '👥', sub: 'Total' },
          { label: 'Posts This Week', value: thisWeekPosts.length, icon: '🎬', sub: 'Last 7 days' },
          { label: 'Ready to Post', value: readyIdeas.length, icon: '✅', sub: 'Ideas queued' },
          { label: 'Avg Engagement', value: insights ? `${insights.avgEngagementRate.toFixed(1)}%` : '—', icon: '📈', sub: 'Across all posts' },
        ].map((stat, i) => (
          <div key={stat.label} className={`pp-card animate-fade-up animate-delay-${i + 1}`} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--tt-muted)', marginTop: '4px' }}>{stat.sub}</div>
              </div>
              <div style={{ fontSize: '24px' }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Posts */}
        <div className="pp-card animate-fade-up animate-delay-2" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px' }}>Recent Posts</h2>
            <Link href="/posts" style={{ fontSize: '12px', color: 'var(--tt-red)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ color: 'var(--tt-muted)', fontSize: '14px' }}>Loading…</div>
          ) : recentPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
              <div style={{ color: 'var(--tt-muted)', fontSize: '14px', marginBottom: '16px' }}>No posts yet — add your first video</div>
              <Link href="/posts/new" className="pp-btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>+ Add Post</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentPosts.map(post => {
                const snapshots = post.post_metric_snapshots ?? []
                const latest = snapshots.sort((a, b) => (b.hours_since_post ?? 0) - (a.hours_since_post ?? 0))[0]
                const perf = post.performance_rating ? PERFORMANCE_CONFIG[post.performance_rating] : null
                return (
                  <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', background: 'var(--tt-card2)', transition: 'background 0.2s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: post.content_pillars?.color ? `${post.content_pillars.color}25` : 'rgba(254,44,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      {perf?.emoji ?? '🎬'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--tt-muted)' }}>{format(new Date(post.posted_at), 'MMM d')} · {latest ? formatNumber(latest.views) + ' views' : 'No stats yet'}</div>
                    </div>
                    {post.content_pillars && (
                      <div className="pill" style={{ background: `${post.content_pillars.color}20`, color: post.content_pillars.color, flexShrink: 0 }}>
                        {post.content_pillars.name}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Idea pipeline */}
          <div className="pp-card animate-fade-up animate-delay-3" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px' }}>Idea Pipeline</h2>
              <Link href="/ideas" style={{ fontSize: '12px', color: 'var(--tt-red)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Ideas', count: ideas.filter(i => i.status === 'idea').length, color: '#7070a0' },
                { label: 'In Progress', count: ideas.filter(i => ['planned','scripted','filmed','editing'].includes(i.status)).length, color: '#f59e0b' },
                { label: 'Ready', count: readyIdeas.length, color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px', background: 'var(--tt-dark)', borderRadius: '10px', textAlign: 'center', border: `1px solid ${item.color}30` }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: item.color }}>{item.count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--tt-muted)', marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </div>
            {draftIdeas.slice(0, 3).map(idea => (
              <Link key={idea.id} href={`/ideas`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '8px', background: 'var(--tt-dark)', borderRadius: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: idea.priority === 'must_post' ? '#fe2c55' : idea.priority === 'high' ? '#f59e0b' : '#7070a0', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{idea.title}</div>
              </Link>
            ))}
            <Link href="/ideas/new" className="pp-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '14px', fontSize: '13px' }}>
              + New Idea
            </Link>
          </div>

          {/* Winner post */}
          {bestPost && (
            <div className="pp-card animate-fade-up animate-delay-4" style={{ padding: '24px', borderColor: 'rgba(254,44,85,0.3)', background: 'linear-gradient(135deg, var(--tt-card) 0%, rgba(254,44,85,0.05) 100%)' }}>
              <div style={{ fontSize: '11px', color: 'var(--tt-red)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>🏆 Best Performer</div>
              <div style={{ fontWeight: 700, fontFamily: 'Syne, sans-serif', fontSize: '15px', marginBottom: '8px' }}>{bestPost.title}</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(() => {
                  const snap = (bestPost.post_metric_snapshots ?? []).sort((a,b) => (b.hours_since_post??0)-(a.hours_since_post??0))[0]
                  if (!snap) return <span style={{ color: 'var(--tt-muted)', fontSize: '13px' }}>Add stats to see metrics</span>
                  return [
                    { label: 'Views', value: formatNumber(snap.views) },
                    { label: 'Likes', value: formatNumber(snap.likes) },
                    { label: 'Engagement', value: `${snap.engagement_rate?.toFixed(1)}%` },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#fe2c55' }}>{m.value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--tt-muted)' }}>{m.label}</div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}

          {/* Quick insight */}
          {insights?.bestPillar && (
            <div className="pp-card animate-fade-up animate-delay-5" style={{ padding: '20px', borderColor: 'rgba(37,244,238,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#25f4ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>💡 Top Insight</div>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
                <strong style={{ color: insights.bestPillar.color }}>{insights.bestPillar.name}</strong> content is your strongest category with{' '}
                <strong>{insights.bestPillar.avgEngagement.toFixed(1)}%</strong> average engagement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Setup prompt */}
      {posts.length === 0 && ideas.length === 0 && (
        <div className="pp-card animate-fade-up" style={{ marginTop: '24px', padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Welcome to PostPilot!</h2>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Start by adding a content idea or logging a recent TikTok post to begin tracking what works.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/ideas/new" className="pp-btn-primary">💡 Add First Idea</Link>
            <Link href="/posts/new" className="pp-btn-secondary">🎬 Log a Post</Link>
          </div>
        </div>
      )}
    </div>
  )
}
