'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { getIdeas, updateIdea, getPillars } from '@/lib/services/data'
import type { ContentIdea, ContentPillar, ContentFormat, HookType, IdeaPriority, IdeaStatus } from '@/lib/types'
import { FORMAT_LABELS, HOOK_LABELS, STATUS_LABELS } from '@/lib/utils'

export default function EditIdeaPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const router = useRouter()
  const [idea, setIdea] = useState<ContentIdea | null>(null)
  const [pillars, setPillars] = useState<ContentPillar[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '', idea_notes: '', hook_text: '', caption_draft: '',
    hashtags_draft: '', sound_name: '', inspiration_url: '',
    content_format: '' as ContentFormat | '',
    hook_type: '' as HookType | '',
    priority: 'medium' as IdeaPriority,
    status: 'idea' as IdeaStatus,
    content_pillar_id: '',
    planned_post_at: '',
  })

  useEffect(() => {
    if (!profile) return
    Promise.all([getIdeas(profile.id), getPillars(profile.id)]).then(([ideas, p]) => {
      const found = ideas.find(i => i.id === id)
      if (found) {
        setIdea(found)
        setForm({
          title: found.title, idea_notes: found.idea_notes ?? '', hook_text: found.hook_text ?? '',
          caption_draft: found.caption_draft ?? '', hashtags_draft: found.hashtags_draft ?? '',
          sound_name: found.sound_name ?? '', inspiration_url: found.inspiration_url ?? '',
          content_format: (found.content_format ?? '') as ContentFormat | '',
          hook_type: (found.hook_type ?? '') as HookType | '',
          priority: found.priority, status: found.status,
          content_pillar_id: found.content_pillar_id ?? '',
          planned_post_at: found.planned_post_at ? found.planned_post_at.slice(0, 16) : '',
        })
      }
      setPillars(p)
    })
  }, [profile, id])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea) return
    setSaving(true)
    await updateIdea(idea.id, {
      title: form.title, idea_notes: form.idea_notes || undefined,
      hook_text: form.hook_text || undefined, caption_draft: form.caption_draft || undefined,
      hashtags_draft: form.hashtags_draft || undefined, sound_name: form.sound_name || undefined,
      inspiration_url: form.inspiration_url || undefined,
      content_format: (form.content_format || undefined) as ContentFormat | undefined,
      hook_type: (form.hook_type || undefined) as HookType | undefined,
      priority: form.priority, status: form.status,
      content_pillar_id: form.content_pillar_id || undefined,
      planned_post_at: form.planned_post_at || undefined,
    })
    setSaving(false)
    router.push('/ideas')
  }

  if (!idea) return <div style={{ color: 'var(--tt-muted)' }}>Loading…</div>

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <Link href="/ideas" style={{ color: 'var(--tt-muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>← Back to Ideas</Link>
        <h1 style={{ fontSize: '26px' }}>Edit Idea ✏️</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="pp-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="pp-label">Title *</label>
            <input className="pp-input" value={form.title} onChange={set('title')} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="pp-label">Pillar</label>
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
            <div>
              <label className="pp-label">Status</label>
              <select className="pp-input" value={form.status} onChange={set('status')}>
                {(['idea','planned','scripted','filmed','editing','ready_to_post'] as IdeaStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="pp-label">Hook</label>
            <input className="pp-input" value={form.hook_text} onChange={set('hook_text')} />
          </div>
          <div>
            <label className="pp-label">Hook Type</label>
            <select className="pp-input" value={form.hook_type} onChange={set('hook_type')}>
              <option value="">— None —</option>
              {Object.entries(HOOK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="pp-label">Notes / Script Outline</label>
            <textarea className="pp-input" value={form.idea_notes} onChange={set('idea_notes')} style={{ minHeight: '100px' }} />
          </div>
          <div>
            <label className="pp-label">Caption Draft</label>
            <textarea className="pp-input" value={form.caption_draft} onChange={set('caption_draft')} style={{ minHeight: '70px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="pp-label">Hashtags</label>
              <input className="pp-input" value={form.hashtags_draft} onChange={set('hashtags_draft')} />
            </div>
            <div>
              <label className="pp-label">Sound</label>
              <input className="pp-input" value={form.sound_name} onChange={set('sound_name')} />
            </div>
          </div>
          <div>
            <label className="pp-label">Planned Post Date</label>
            <input className="pp-input" type="datetime-local" value={form.planned_post_at} onChange={set('planned_post_at')} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="pp-btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Saving…' : '✓ Save Changes'}
            </button>
            <Link href="/ideas" className="pp-btn-secondary">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
