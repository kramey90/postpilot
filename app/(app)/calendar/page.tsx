'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { getIdeas, getPosts } from '@/lib/services/data'
import type { ContentIdea, ContentPost } from '@/lib/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

export default function CalendarPage() {
  const { profile } = useAuth()
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([getIdeas(profile.id), getPosts(profile.id)]).then(([i, p]) => {
      setIdeas(i)
      setPosts(p)
      setLoading(false)
    })
  }, [profile])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const firstDayOfWeek = startOfMonth(currentMonth).getDay()

  const getIdeasForDay = (day: Date) => ideas.filter(i => i.planned_post_at && isSameDay(new Date(i.planned_post_at), day))
  const getPostsForDay = (day: Date) => posts.filter(p => isSameDay(new Date(p.posted_at), day))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="animate-fade-up">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Content Calendar 📅</h1>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px' }}>Plan your posting schedule</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/ideas/new" className="pp-btn-secondary" style={{ fontSize: '13px' }}>+ Plan Idea</Link>
          <Link href="/posts/new" className="pp-btn-primary" style={{ fontSize: '13px' }}>+ Log Post</Link>
        </div>
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }} className="animate-fade-up animate-delay-1">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="pp-btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>←</button>
        <h2 style={{ fontSize: '20px', minWidth: '160px', textAlign: 'center' }}>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="pp-btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>→</button>
        <button onClick={() => setCurrentMonth(new Date())} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--tt-border)', borderRadius: '8px', color: 'var(--tt-muted)', cursor: 'pointer', fontSize: '12px' }}>Today</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '12px', color: 'var(--tt-muted)' }} className="animate-fade-up animate-delay-2">
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: 'rgba(254,44,85,0.3)', borderRadius: '3px', border: '1px solid rgba(254,44,85,0.6)', display: 'inline-block' }} /> Posted</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: 'rgba(37,244,238,0.2)', borderRadius: '3px', border: '1px solid rgba(37,244,238,0.4)', display: 'inline-block' }} /> Planned</span>
      </div>

      {/* Calendar grid */}
      <div className="pp-card animate-fade-up animate-delay-2" style={{ padding: '20px' }}>
        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--tt-muted)', fontWeight: 700, fontFamily: 'Syne, sans-serif', padding: '4px' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {/* Empty cells for first week offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}

          {days.map(day => {
            const dayIdeas = getIdeasForDay(day)
            const dayPosts = getPostsForDay(day)
            const hasContent = dayIdeas.length > 0 || dayPosts.length > 0
            const today = isToday(day)

            return (
              <div key={day.toISOString()}
                style={{ minHeight: '80px', padding: '6px', borderRadius: '8px', border: `1px solid ${today ? 'var(--tt-red)' : hasContent ? 'var(--tt-border)' : 'transparent'}`, background: today ? 'rgba(254,44,85,0.05)' : hasContent ? 'var(--tt-dark)' : 'transparent', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '12px', fontWeight: today ? 800 : 500, fontFamily: 'Syne, sans-serif', color: today ? 'var(--tt-red)' : 'var(--tt-text)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  {format(day, 'd')}
                  {today && <span style={{ fontSize: '10px', background: 'var(--tt-red)', color: 'white', padding: '1px 5px', borderRadius: '4px' }}>TODAY</span>}
                </div>

                {/* Posted dots */}
                {dayPosts.slice(0, 2).map(post => (
                  <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none', display: 'block', padding: '2px 5px', borderRadius: '4px', background: 'rgba(254,44,85,0.2)', border: '1px solid rgba(254,44,85,0.4)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10px', fontWeight: 600, color: '#fe2c55' }}>
                    🎬 {post.title}
                  </Link>
                ))}

                {/* Planned ideas */}
                {dayIdeas.slice(0, 2).map(idea => (
                  <div key={idea.id} style={{ padding: '2px 5px', borderRadius: '4px', background: 'rgba(37,244,238,0.1)', border: '1px solid rgba(37,244,238,0.3)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10px', fontWeight: 600, color: '#25f4ee' }}>
                    💡 {idea.title}
                  </div>
                ))}

                {(dayPosts.length + dayIdeas.length > 2) && (
                  <div style={{ fontSize: '9px', color: 'var(--tt-muted)', padding: '1px 4px' }}>+{dayPosts.length + dayIdeas.length - 2} more</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming planned */}
      {ideas.filter(i => i.planned_post_at && new Date(i.planned_post_at) >= new Date()).length > 0 && (
        <div className="pp-card animate-fade-up" style={{ padding: '24px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>📋 Upcoming Planned Posts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ideas
              .filter(i => i.planned_post_at && new Date(i.planned_post_at) >= new Date())
              .sort((a, b) => new Date(a.planned_post_at!).getTime() - new Date(b.planned_post_at!).getTime())
              .slice(0, 8)
              .map(idea => (
                <div key={idea.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', background: 'var(--tt-dark)', borderRadius: '10px' }}>
                  {idea.content_pillars && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: idea.content_pillars.color, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{idea.title}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--tt-red)', fontWeight: 700, flexShrink: 0 }}>
                    {format(new Date(idea.planned_post_at!), 'MMM d · h:mm a')}
                  </div>
                  <span className={`pill ${STATUS_COLORS[idea.status]}`}>{STATUS_LABELS[idea.status]}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
