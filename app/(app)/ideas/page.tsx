'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { getIdeas, deleteIdea, updateIdea } from '@/lib/services/data'
import type { ContentIdea, IdeaStatus } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, FORMAT_LABELS, HOOK_LABELS } from '@/lib/utils'
import { format } from 'date-fns'

const KANBAN_COLUMNS: IdeaStatus[] = ['idea', 'planned', 'scripted', 'filming', 'editing', 'ready_to_post'] as any

const COLUMN_ORDER: IdeaStatus[] = ['idea', 'planned', 'scripted', 'filmed', 'editing', 'ready_to_post']

export default function IdeasPage() {
  const { profile } = useAuth()
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [filter, setFilter] = useState<string>('all')

  const load = async () => {
    if (!profile) return
    const data = await getIdeas(profile.id)
    setIdeas(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [profile])

  const handleStatusChange = async (id: string, status: IdeaStatus) => {
    await updateIdea(id, { status })
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this idea?')) return
    await deleteIdea(id)
    setIdeas(prev => prev.filter(i => i.id !== id))
  }

  const filtered = filter === 'all' ? ideas : ideas.filter(i => i.status === filter)

  if (loading) return <div style={{ color: 'var(--tt-muted)' }}>Loading…</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }} className="animate-fade-up">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Idea Vault 💡</h1>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px' }}>{ideas.length} ideas captured</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--tt-card)', border: '1px solid var(--tt-border)', borderRadius: '8px', padding: '3px' }}>
            {(['kanban', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: view === v ? 'var(--tt-red)' : 'transparent', color: view === v ? 'white' : 'var(--tt-muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '12px' }}>
                {v === 'kanban' ? '⊞ Board' : '≡ List'}
              </button>
            ))}
          </div>
          <Link href="/ideas/new" className="pp-btn-primary" style={{ fontSize: '13px' }}>+ New Idea</Link>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="pp-card" style={{ padding: '60px', textAlign: 'center', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💡</div>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Your Idea Vault is empty</h2>
          <p style={{ color: 'var(--tt-muted)', fontSize: '14px', marginBottom: '20px' }}>Capture content ideas before they slip away</p>
          <Link href="/ideas/new" className="pp-btn-primary">Add Your First Idea</Link>
        </div>
      ) : view === 'list' ? (
        /* LIST VIEW */
        <div className="animate-fade-up">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['all', ...COLUMN_ORDER].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'Syne, sans-serif', background: filter === s ? 'var(--tt-red)' : 'var(--tt-card)', borderColor: filter === s ? 'var(--tt-red)' : 'var(--tt-border)', color: filter === s ? 'white' : 'var(--tt-muted)' }}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(idea => (
              <IdeaListRow key={idea.id} idea={idea} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }} className="animate-fade-up">
          {COLUMN_ORDER.map(col => {
            const colIdeas = ideas.filter(i => i.status === col)
            return (
              <div key={col} style={{ minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Column header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`pill ${STATUS_COLORS[col]}`}>{STATUS_LABELS[col]}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--tt-muted)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{colIdeas.length}</span>
                </div>
                {/* Cards */}
                {colIdeas.map(idea => (
                  <IdeaKanbanCard key={idea.id} idea={idea} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                ))}
                {col === 'idea' && (
                  <Link href="/ideas/new" style={{ textDecoration: 'none', display: 'block', padding: '10px', border: '1px dashed var(--tt-border)', borderRadius: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--tt-muted)', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--tt-red)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--tt-border)')}>
                    + Add idea
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function IdeaKanbanCard({ idea, onDelete, onStatusChange }: { idea: ContentIdea; onDelete: (id: string) => void; onStatusChange: (id: string, s: IdeaStatus) => void }) {
  const NEXT: Partial<Record<IdeaStatus, IdeaStatus>> = {
    idea: 'planned', planned: 'scripted', scripted: 'filmed', filmed: 'editing', editing: 'ready_to_post'
  }
  const next = NEXT[idea.status]

  return (
    <div className="pp-card pp-card-hover" style={{ padding: '14px' }}>
      {idea.content_pillars && (
        <div className="pill" style={{ background: `${idea.content_pillars.color}20`, color: idea.content_pillars.color, marginBottom: '8px' }}>
          {idea.content_pillars.name}
        </div>
      )}
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', lineHeight: 1.4 }}>{idea.title}</div>
      {idea.hook_text && (
        <div style={{ fontSize: '12px', color: 'var(--tt-muted)', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          "{idea.hook_text}"
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {idea.content_format && <span style={{ fontSize: '11px', color: 'var(--tt-muted)' }}>{FORMAT_LABELS[idea.content_format]}</span>}
        <span style={{ fontSize: '11px', color: PRIORITY_COLORS[idea.priority].replace('text-', '') === 'red-400' ? '#f87171' : PRIORITY_COLORS[idea.priority].includes('yellow') ? '#fbbf24' : PRIORITY_COLORS[idea.priority].includes('orange') ? '#fb923c' : '#7070a0' }}>
          {idea.priority === 'must_post' ? '🔥 Must Post' : idea.priority}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--tt-border)' }}>
        {next ? (
          <button onClick={() => onStatusChange(idea.id, next)}
            style={{ fontSize: '11px', color: 'var(--tt-red)', background: 'rgba(254,44,85,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontWeight: 600 }}>
            → {STATUS_LABELS[next]}
          </button>
        ) : <div />}
        <div style={{ display: 'flex', gap: '6px' }}>
          <Link href={`/ideas/${idea.id}/edit`} style={{ fontSize: '11px', color: 'var(--tt-muted)', textDecoration: 'none', padding: '4px 8px', borderRadius: '6px', background: 'var(--tt-dark)' }}>Edit</Link>
          <button onClick={() => onDelete(idea.id)} style={{ fontSize: '11px', color: 'var(--tt-muted)', background: 'var(--tt-dark)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
        </div>
      </div>
    </div>
  )
}

function IdeaListRow({ idea, onDelete, onStatusChange }: { idea: ContentIdea; onDelete: (id: string) => void; onStatusChange: (id: string, s: IdeaStatus) => void }) {
  return (
    <div className="pp-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      {idea.content_pillars && (
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: idea.content_pillars.color, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{idea.title}</div>
        <div style={{ fontSize: '12px', color: 'var(--tt-muted)' }}>
          {format(new Date(idea.created_at), 'MMM d')}
          {idea.content_format && ` · ${FORMAT_LABELS[idea.content_format]}`}
        </div>
      </div>
      <span className={`pill ${STATUS_COLORS[idea.status]}`}>{STATUS_LABELS[idea.status]}</span>
      <select value={idea.status} onChange={e => onStatusChange(idea.id, e.target.value as IdeaStatus)}
        style={{ background: 'var(--tt-card2)', border: '1px solid var(--tt-border)', color: 'var(--tt-text)', borderRadius: '8px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
        {COLUMN_ORDER.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>
      <Link href={`/ideas/${idea.id}/edit`} style={{ fontSize: '12px', color: 'var(--tt-muted)', textDecoration: 'none' }}>Edit</Link>
      <button onClick={() => onDelete(idea.id)} style={{ color: 'var(--tt-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
    </div>
  )
}
