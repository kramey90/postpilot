'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { getPosts } from '@/lib/services/data'
import type { ContentPost } from '@/lib/types'
import { formatNumber, PERFORMANCE_CONFIG, FORMAT_LABELS } from '@/lib/utils'
import { format } from 'date-fns'

export default function PostsPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    getPosts(profile.id).then(p => { setPosts(p); setLoading(false) })
  }, [profile])

  if (loading) return <div style={{ color: 'var(--tt-muted)' }}>Loading…</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="animate-fade-up">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Post Journal 🎬</h1>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px' }}>{posts.length} posts logged</p>
        </div>
        <Link href="/posts/new" className="pp-btn-primary">+ Log Post</Link>
      </div>

      {posts.length === 0 ? (
        <div className="pp-card" style={{ padding: '60px', textAlign: 'center', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>No posts logged yet</h2>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px', marginBottom: '20px' }}>Start tracking your TikTok performance</p>
          <Link href="/posts/new" className="pp-btn-primary">Log Your First Post</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-fade-up animate-delay-1">
          {posts.map(post => <PostRow key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}

function PostRow({ post }: { post: ContentPost }) {
  const snapshots = post.post_metric_snapshots ?? []
  const latest = [...snapshots].sort((a, b) => (b.hours_since_post ?? 0) - (a.hours_since_post ?? 0))[0]
  const perf = post.performance_rating ? PERFORMANCE_CONFIG[post.performance_rating] : null
  const snapshotLabels = snapshots.map(s => s.snapshot_label)

  return (
    <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
      <div className="pp-card pp-card-hover" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Perf indicator */}
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: post.content_pillars?.color ? `${post.content_pillars.color}20` : 'rgba(254,44,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
          {perf?.emoji ?? '🎬'}
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--tt-muted)', display: 'flex', gap: '12px' }}>
            <span>{format(new Date(post.posted_at), 'MMM d, yyyy')}</span>
            {post.content_format && <span>{FORMAT_LABELS[post.content_format]}</span>}
            {post.video_duration_seconds && <span>{post.video_duration_seconds}s</span>}
          </div>
        </div>

        {/* Pillar */}
        {post.content_pillars && (
          <div className="pill" style={{ background: `${post.content_pillars.color}20`, color: post.content_pillars.color, flexShrink: 0 }}>
            {post.content_pillars.name}
          </div>
        )}

        {/* Metrics */}
        {latest ? (
          <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
            {[
              { label: 'Views', value: formatNumber(latest.views) },
              { label: 'Likes', value: formatNumber(latest.likes) },
              { label: 'Engage', value: `${(latest.engagement_rate ?? 0).toFixed(1)}%` },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px' }}>{m.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--tt-muted)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--tt-muted)', flexShrink: 0 }}>No stats yet</div>
        )}

        {/* Snapshot count */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '3px' }}>
          {(['1h','3h','24h','48h','7d','30d'] as const).map(label => (
            <div key={label} style={{ width: '6px', height: '6px', borderRadius: '50%', background: snapshotLabels.includes(label) ? 'var(--tt-red)' : 'var(--tt-border)' }} />
          ))}
        </div>
      </div>
    </Link>
  )
}
