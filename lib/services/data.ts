import { createClient } from '@/lib/supabase/client'
import type { ContentPost, ContentIdea, PostMetricSnapshot, ContentPillar, CreatorProfile, SnapshotLabel } from '@/lib/types'

// ─── CREATOR PROFILE ──────────────────────────────────────
export async function getOrCreateProfile(userId: string): Promise<CreatorProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) { console.error(error); return null }
  return data
}

export async function createProfile(userId: string, displayName: string): Promise<CreatorProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('creator_profiles')
    .insert({ user_id: userId, display_name: displayName, current_follower_count: 0 })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateProfile(id: string, updates: Partial<CreatorProfile>): Promise<CreatorProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('creator_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateProfile error:', error); return null }
  return data
}

// ─── CONTENT PILLARS ─────────────────────────────────────
export async function getPillars(profileId: string): Promise<ContentPillar[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('content_pillars')
    .select('*')
    .eq('creator_profile_id', profileId)
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

export async function createPillar(profileId: string, name: string, color: string): Promise<ContentPillar | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('content_pillars')
    .insert({ creator_profile_id: profileId, name, color })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

// ─── CONTENT IDEAS ────────────────────────────────────────
export async function getIdeas(profileId: string): Promise<ContentIdea[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('content_ideas')
    .select('*, content_pillars(*)')
    .eq('creator_profile_id', profileId)
    .neq('status', 'scrapped')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createIdea(idea: Partial<ContentIdea> & { creator_profile_id: string; title: string }): Promise<ContentIdea | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('content_ideas')
    .insert(idea)
    .select('*, content_pillars(*)')
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateIdea(id: string, updates: Partial<ContentIdea>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('content_ideas').update(updates).eq('id', id)
  return !error
}

export async function deleteIdea(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('content_ideas').delete().eq('id', id)
  return !error
}

// ─── CONTENT POSTS ────────────────────────────────────────
export async function getPosts(profileId: string): Promise<ContentPost[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('content_posts')
    .select('*, content_pillars(*), post_metric_snapshots(*)')
    .eq('creator_profile_id', profileId)
    .order('posted_at', { ascending: false })
  return data ?? []
}

export async function getPost(id: string): Promise<ContentPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('content_posts')
    .select('*, content_pillars(*), post_metric_snapshots(*)')
    .eq('id', id)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function createPost(post: Partial<ContentPost> & { creator_profile_id: string; title: string; posted_at: string }): Promise<ContentPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('content_posts')
    .insert(post)
    .select('*, content_pillars(*), post_metric_snapshots(*)')
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updatePost(id: string, updates: Partial<ContentPost>): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('content_posts').update(updates).eq('id', id)
  return !error
}

export async function deletePost(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('content_posts').delete().eq('id', id)
  return !error
}

// ─── METRIC SNAPSHOTS ────────────────────────────────────
const HOURS_MAP: Record<SnapshotLabel, number> = {
  '1h': 1, '3h': 3, '24h': 24, '48h': 48, '7d': 168, '30d': 720
}

export async function addSnapshot(
  postId: string,
  label: SnapshotLabel,
  metrics: { views: number; likes: number; comments: number; shares: number; saves: number; follows_gained: number; profile_views?: number; average_watch_time_seconds?: number; completion_rate?: number }
): Promise<PostMetricSnapshot | null> {
  const supabase = createClient()
  const hours = HOURS_MAP[label]

  // Calculate rates
  const engagementRate = metrics.views > 0
    ? ((metrics.likes + metrics.comments + metrics.shares + metrics.saves) / metrics.views) * 100
    : 0
  const shareRate = metrics.views > 0 ? (metrics.shares / metrics.views) * 100 : 0
  const saveRate = metrics.views > 0 ? (metrics.saves / metrics.views) * 100 : 0
  const followConversionRate = metrics.views > 0 ? (metrics.follows_gained / metrics.views) * 100 : 0

  const { data, error } = await supabase
    .from('post_metric_snapshots')
    .upsert({
      content_post_id: postId,
      snapshot_label: label,
      hours_since_post: hours,
      ...metrics,
      engagement_rate: engagementRate,
      share_rate: shareRate,
      save_rate: saveRate,
      follow_conversion_rate: followConversionRate
    }, { onConflict: 'content_post_id,snapshot_label' })
    .select()
    .single()

  if (error) { console.error(error); return null }
  return data
}

// ─── INSIGHTS ENGINE ──────────────────────────────────────
export async function computeInsights(profileId: string) {
  const posts = await getPosts(profileId)
  if (!posts.length) return null

  // Get latest snapshot per post
  const postsWithLatest = posts.map(p => {
    const snapshots = p.post_metric_snapshots ?? []
    const sorted = [...snapshots].sort((a, b) => (b.hours_since_post ?? 0) - (a.hours_since_post ?? 0))
    return { post: p, latest: sorted[0] ?? null }
  }).filter(x => x.latest)

  // Average engagement rate across all posts
  const avgEngRate = postsWithLatest.reduce((acc, { latest }) =>
    acc + (latest?.engagement_rate ?? 0), 0) / (postsWithLatest.length || 1)

  // Total followers gained
  const totalFollowersGained = postsWithLatest.reduce((acc, { latest }) =>
    acc + (latest?.follows_gained ?? 0), 0)

  // Best posting hour
  const hourMap: Record<number, { totalViews: number; count: number }> = {}
  postsWithLatest.forEach(({ post, latest }) => {
    const hour = new Date(post.posted_at).getHours()
    if (!hourMap[hour]) hourMap[hour] = { totalViews: 0, count: 0 }
    hourMap[hour].totalViews += latest?.views ?? 0
    hourMap[hour].count++
  })
  const bestPostingHours = Object.entries(hourMap)
    .map(([hour, { totalViews, count }]) => ({ hour: parseInt(hour), avgViews: Math.round(totalViews / count) }))
    .sort((a, b) => b.avgViews - a.avgViews)
    .slice(0, 3)

  // Best pillar
  const pillarMap: Record<string, { name: string; color: string; total: number; count: number }> = {}
  postsWithLatest.forEach(({ post, latest }) => {
    if (!post.content_pillars) return
    const pid = post.content_pillar_id!
    if (!pillarMap[pid]) pillarMap[pid] = { name: post.content_pillars.name, color: post.content_pillars.color, total: 0, count: 0 }
    pillarMap[pid].total += latest?.engagement_rate ?? 0
    pillarMap[pid].count++
  })
  const bestPillar = Object.values(pillarMap)
    .map(p => ({ ...p, avgEngagement: p.total / p.count }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)[0] ?? null

  // Best format
  const formatMap: Record<string, { total: number; count: number }> = {}
  postsWithLatest.forEach(({ post, latest }) => {
    if (!post.content_format) return
    if (!formatMap[post.content_format]) formatMap[post.content_format] = { total: 0, count: 0 }
    formatMap[post.content_format].total += latest?.views ?? 0
    formatMap[post.content_format].count++
  })
  const bestFormat = Object.entries(formatMap)
    .map(([format, { total, count }]) => ({ format, avgViews: Math.round(total / count) }))
    .sort((a, b) => b.avgViews - a.avgViews)[0] ?? null

  // Winner posts (2x average views)
  const avgViews = postsWithLatest.reduce((acc, { latest }) =>
    acc + (latest?.views ?? 0), 0) / (postsWithLatest.length || 1)
  const winnerPosts = postsWithLatest
    .filter(({ latest }) => (latest?.views ?? 0) > avgViews * 2)
    .map(({ post }) => post)

  // Top save rate
  const topSaveRateEntry = postsWithLatest
    .filter(({ latest }) => latest?.save_rate && latest.save_rate > 0)
    .sort((a, b) => (b.latest?.save_rate ?? 0) - (a.latest?.save_rate ?? 0))[0]
  const topSaveRate = topSaveRateEntry
    ? { title: topSaveRateEntry.post.title, rate: topSaveRateEntry.latest?.save_rate ?? 0 }
    : null

  return {
    bestPostingHours,
    bestPillar,
    bestFormat,
    winnerPosts,
    avgEngagementRate: avgEngRate,
    totalFollowersGained,
    topSaveRate,
    avgViews
  }
}
