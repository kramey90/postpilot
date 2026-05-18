import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}

export function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

export const PILLAR_COLORS = [
  '#fe2c55', '#25f4ee', '#ff6b35', '#8b5cf6', '#10b981',
  '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'
]

export const STATUS_LABELS: Record<string, string> = {
  idea: 'Idea',
  planned: 'Planned',
  scripted: 'Scripted',
  filmed: 'Filmed',
  editing: 'Editing',
  ready_to_post: 'Ready to Post',
  posted: 'Posted',
  scrapped: 'Scrapped'
}

export const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-gray-500/20 text-gray-300',
  planned: 'bg-blue-500/20 text-blue-300',
  scripted: 'bg-purple-500/20 text-purple-300',
  filmed: 'bg-yellow-500/20 text-yellow-300',
  editing: 'bg-orange-500/20 text-orange-300',
  ready_to_post: 'bg-green-500/20 text-green-300',
  posted: 'bg-teal-500/20 text-teal-300',
  scrapped: 'bg-red-500/20 text-red-300'
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  must_post: 'text-red-400'
}

export const PERFORMANCE_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  flop: { label: 'Flop', color: 'text-red-400', emoji: '💀' },
  normal: { label: 'Normal', color: 'text-gray-400', emoji: '😐' },
  good: { label: 'Good', color: 'text-green-400', emoji: '✅' },
  winner: { label: 'Winner', color: 'text-yellow-400', emoji: '🏆' },
  viral: { label: 'Viral', color: 'text-pink-400', emoji: '🚀' }
}

export const FORMAT_LABELS: Record<string, string> = {
  storytime: 'Storytime',
  grwm: 'GRWM',
  haul: 'Haul',
  tutorial: 'Tutorial',
  day_in_the_life: 'Day in the Life',
  before_after: 'Before & After',
  trend_remix: 'Trend Remix',
  talking_head: 'Talking Head',
  voiceover: 'Voiceover',
  product_review: 'Product Review',
  listicle: 'Listicle',
  response_video: 'Response Video'
}

export const HOOK_LABELS: Record<string, string> = {
  question: 'Question',
  hot_take: 'Hot Take',
  relatable_problem: 'Relatable Problem',
  curiosity_gap: 'Curiosity Gap',
  confession: 'Confession',
  before_after: 'Before & After',
  mistake: 'Mistake',
  story_opener: 'Story Opener',
  direct_value: 'Direct Value',
  controversial_opinion: 'Controversial Opinion'
}
