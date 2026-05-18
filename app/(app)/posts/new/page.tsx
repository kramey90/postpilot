'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { createPost, getPillars } from '@/lib/services/data'
import type { ContentPillar, ContentFormat, HookType, CtaType } from '@/lib/types'
import { FORMAT_LABELS, HOOK_LABELS } from '@/lib/utils'
import { format } from 'date-fns'

export default function NewPostPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [pillars, setPillars] = useState<ContentPillar[]>([])
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const [form, setForm] = useState({
    title: '', post_url: '', caption: '', hook_text: '',
    content_format: '' as ContentFormat | '',
    hook_type: '' as HookType | '',
    content_pillar_id: '',
    video_duration_seconds: '',
    posted_at: format(now, "yyyy-MM-dd'T'HH:mm"),
    used_trending_sound: false,
    sound_name: '',
    cta_type: 'none' as CtaType,
    creator_confidence_score: '7',
    thumbnail_note: '',
    lesson_learned: '',
  })

  useEffect(() => {
    if (profile) getPillars(profile.id).then(setPillars)
  }, [profile])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !form.title || !form.posted_at) return
    setSaving(true)
    const post = await createPost({
      creator_profile_id: profile.id,
      title: form.title,
      post_url: form.post_url || undefined,
      caption: form.caption || undefined,
      hook_text: form.hook_text || undefined,
      content_format: (form.content_format || undefined) as ContentFormat | undefined,
      hook_type: (form.hook_type || undefined) as HookType | undefined,
      content_pillar_id: form.content_pillar_id || undefined,
      video_duration_seconds: form.video_duration_seconds ? parseInt(form.video_duration_seconds) : undefined,
      posted_at: new Date(form.posted_at).toISOString(),
      used_trending_sound: form.used_trending_sound,
      sound_name: form.sound_name || undefined,
      cta_type: form.cta_type,
      creator_confidence_score: form.creator_confidence_score ? parseInt(form.creator_confidence_score) : undefined,
      thumbnail_note: form.thumbnail_note || undefined,
      lesson_learned: form.lesson_learned || undefined,
    })
    setSaving(false)
    if (post) router.push(`/posts/${post.id}`)
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }} className="animate-fade-up">
        <Link href="/posts" style={{ color: 'var(--tt-muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>← Back to Posts</Link>
        <h1 style={{ fontSize: '26px' }}>Log a Post 🎬</h1>
        <p style={{ color: 'var(--tt-muted)', fontSize: '14px', marginTop: '4px' }}>Record what you posted and start tracking stats</p>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-up animate-delay-1">
        <div className="pp-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div>
            <label className="pp-label">Post Title *</label>
            <input className="pp-input" value={form.title} onChange={set('title')} placeholder="e.g. Mom GRWM - school pickup outfit" required />
          </div>

          {/* TikTok URL */}
          <div>
            <label className="pp-label">TikTok URL</label>
            <input className="pp-input" type="url" value={form.post_url} onChange={set('post_url')} placeholder="https://www.tiktok.com/@handle/video/…" />
          </div>

          {/* Date/time + duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="pp-label">Posted At *</label>
              <input className="pp-input" type="datetime-local" value={form.posted_at} onChange={set('posted_at')} required />
            </div>
            <div>
              <label className="pp-label">Video Length (seconds)</label>
              <input className="pp-input" type="number" value={form.video_duration_seconds} onChange={set('video_duration_seconds')} placeholder="e.g. 32" min="1" max="600" />
            </div>
          </div>

          {/* Pillar + Format + Hook */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label className="pp-label">Content Pillar</label>
              <select className="pp-input" value={form.content_pillar_id} onChange={set('content_pillar_id')}>
                <option value="">— None —</option>
                {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="pp-label">Format</label>
              <select className="pp-input" value={form.content_format} onChange={set('content_format')}>
                <option value="">— None —</option>
                {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="pp-label">Hook Type</label>
              <select className="pp-input" value={form.hook_type} onChange={set('hook_type')}>
                <option value="">— None —</option>
                {Object.entries(HOOK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Hook text */}
          <div>
            <label className="pp-label">Opening Hook</label>
            <input className="pp-input" value={form.hook_text} onChange={set('hook_text')} placeholder="First line / hook of the video" />
          </div>

          {/* Caption */}
          <div>
            <label className="pp-label">Caption</label>
            <textarea className="pp-input" value={form.caption} onChange={set('caption')} placeholder="TikTok caption…" style={{ minHeight: '70px' }} />
          </div>

          {/* Sound + CTA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label className="pp-label">Sound Name</label>
              <input className="pp-input" value={form.sound_name} onChange={set('sound_name')} placeholder="Sound used" />
            </div>
            <div>
              <label className="pp-label">CTA Type</label>
              <select className="pp-input" value={form.cta_type} onChange={set('cta_type')}>
                <option value="none">None</option>
                <option value="follow">Follow</option>
                <option value="comment">Comment</option>
                <option value="save">Save</option>
                <option value="share">Share</option>
                <option value="link_in_bio">Link in Bio</option>
                <option value="shop_product">Shop Product</option>
                <option value="watch_part_two">Watch Part 2</option>
              </select>
            </div>
            <div>
              <label className="pp-label">Confidence (1–10)</label>
              <input className="pp-input" type="number" value={form.creator_confidence_score} onChange={set('creator_confidence_score')} min="1" max="10" />
            </div>
          </div>

          {/* Trending sound toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="trending_sound" checked={form.used_trending_sound}
              onChange={e => setForm(f => ({ ...f, used_trending_sound: e.target.checked }))}
              style={{ width: '18px', height: '18px', accentColor: 'var(--tt-red)' }} />
            <label htmlFor="trending_sound" style={{ fontSize: '14px', cursor: 'pointer' }}>Used a trending sound</label>
          </div>

          {/* Lesson learned */}
          <div>
            <label className="pp-label">Initial Thoughts / Lesson Learned</label>
            <textarea className="pp-input" value={form.lesson_learned} onChange={set('lesson_learned')} placeholder="What do you think about this post? Any gut feelings?" style={{ minHeight: '70px' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="submit" className="pp-btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Saving…' : '🎬 Log Post'}
            </button>
            <Link href="/posts" className="pp-btn-secondary">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
