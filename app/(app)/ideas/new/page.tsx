'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { createIdea, getPillars } from '@/lib/services/data'
import type { ContentPillar, ContentFormat, HookType, IdeaPriority } from '@/lib/types'
import { FORMAT_LABELS, HOOK_LABELS } from '@/lib/utils'

export default function NewIdeaPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [pillars, setPillars] = useState<ContentPillar[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '', idea_notes: '', hook_text: '', caption_draft: '',
    hashtags_draft: '', sound_name: '', inspiration_url: '',
    content_format: '' as ContentFormat | '',
    hook_type: '' as HookType | '',
    priority: 'medium' as IdeaPriority,
    content_pillar_id: '',
    planned_post_at: '',
  })

  useEffect(() => {
    if (profile) getPillars(profile.id).then(setPillars)
  }, [profile])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !form.title.trim()) return
    setSaving(true)
    const idea = await createIdea({
      creator_profile_id: profile.id,
      title: form.title,
      idea_notes: form.idea_notes || undefined,
      hook_text: form.hook_text || undefined,
      caption_draft: form.caption_draft || undefined,
      hashtags_draft: form.hashtags_draft || undefined,
      sound_name: form.sound_name || undefined,
      inspiration_url: form.inspiration_url || undefined,
      content_format: (form.content_format || undefined) as ContentFormat | undefined,
      hook_type: (form.hook_type || undefined) as HookType | undefined,
      priority: form.priority,
      content_pillar_id: form.content_pillar_id || undefined,
      planned_post_at: form.planned_post_at || undefined,
    })
    setSaving(false)
    if (idea) router.push('/ideas')
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }} className="animate-fade-up">
        <Link href="/ideas" style={{ color: 'var(--tt-muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>← Back to Ideas</Link>
        <h1 style={{ fontSize: '26px' }}>New Content Idea 💡</h1>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-up animate-delay-1">
        <div className="pp-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div>
            <label className="pp-label">Title *</label>
            <input className="pp-input" value={form.title} onChange={set('title')} placeholder="e.g. Mom outfit for school pickup" required />
          </div>

          {/* Pillar + Format + Hook row */}
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
              <label className="pp-label">Priority</label>
              <select className="pp-input" value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="must_post">🔥 Must Post</option>
              </select>
            </div>
          </div>

          {/* Hook */}
          <div>
            <label className="pp-label">Hook Idea</label>
            <input className="pp-input" value={form.hook_text} onChange={set('hook_text')} placeholder="e.g. I wanted to look put together but still be comfortable…" />
          </div>

          {/* Hook type */}
          <div>
            <label className="pp-label">Hook Type</label>
            <select className="pp-input" value={form.hook_type} onChange={set('hook_type')}>
              <option value="">— None —</option>
              {Object.entries(HOOK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="pp-label">Notes / Script Outline</label>
            <textarea className="pp-input" value={form.idea_notes} onChange={set('idea_notes')} placeholder="What's this video about? Key points, story beats…" style={{ minHeight: '100px' }} />
          </div>

          {/* Caption + Hashtags */}
          <div>
            <label className="pp-label">Caption Draft</label>
            <textarea className="pp-input" value={form.caption_draft} onChange={set('caption_draft')} placeholder="Draft caption for TikTok…" style={{ minHeight: '70px' }} />
          </div>
          <div>
            <label className="pp-label">Hashtags</label>
            <input className="pp-input" value={form.hashtags_draft} onChange={set('hashtags_draft')} placeholder="#momlife #ootd #grwm" />
          </div>

          {/* Sound + Inspo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="pp-label">Sound / Audio</label>
              <input className="pp-input" value={form.sound_name} onChange={set('sound_name')} placeholder="Sound name or idea" />
            </div>
            <div>
              <label className="pp-label">Inspiration Link</label>
              <input className="pp-input" type="url" value={form.inspiration_url} onChange={set('inspiration_url')} placeholder="https://…" />
            </div>
          </div>

          {/* Planned date */}
          <div>
            <label className="pp-label">Planned Post Date</label>
            <input className="pp-input" type="datetime-local" value={form.planned_post_at} onChange={set('planned_post_at')} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="submit" className="pp-btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Saving…' : '💡 Save Idea'}
            </button>
            <Link href="/ideas" className="pp-btn-secondary">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
