export type PrimaryGoal = 'grow_followers' | 'increase_engagement' | 'drive_sales' | 'get_brand_deals' | 'build_community'
export type ContentFormat = 'storytime' | 'grwm' | 'haul' | 'tutorial' | 'day_in_the_life' | 'before_after' | 'trend_remix' | 'talking_head' | 'voiceover' | 'product_review' | 'listicle' | 'response_video'
export type HookType = 'question' | 'hot_take' | 'relatable_problem' | 'curiosity_gap' | 'confession' | 'before_after' | 'mistake' | 'story_opener' | 'direct_value' | 'controversial_opinion'
export type IdeaPriority = 'low' | 'medium' | 'high' | 'must_post'
export type IdeaStatus = 'idea' | 'planned' | 'scripted' | 'filmed' | 'editing' | 'ready_to_post' | 'posted' | 'scrapped'
export type CtaType = 'none' | 'follow' | 'comment' | 'save' | 'share' | 'link_in_bio' | 'shop_product' | 'watch_part_two'
export type PerformanceRating = 'flop' | 'normal' | 'good' | 'winner' | 'viral'
export type ExperimentStatus = 'planned' | 'running' | 'completed' | 'abandoned'
export type MonetizationType = 'creator_fund' | 'affiliate_sale' | 'brand_deal' | 'gift' | 'shop_commission' | 'other'
export type SnapshotLabel = '1h' | '3h' | '24h' | '48h' | '7d' | '30d'

export interface CreatorProfile {
  id: string
  user_id: string
  display_name: string
  niche?: string
  bio?: string
  primary_goal?: PrimaryGoal
  target_audience?: string
  current_follower_count: number
  monetization_goal?: string
  created_at: string
  updated_at: string
}

export interface PlatformAccount {
  id: string
  creator_profile_id: string
  platform: string
  handle?: string
  profile_url?: string
  external_account_id?: string
  is_connected: boolean
  created_at: string
}

export interface ContentPillar {
  id: string
  creator_profile_id: string
  name: string
  description?: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContentIdea {
  id: string
  creator_profile_id: string
  content_pillar_id?: string
  title: string
  idea_notes?: string
  hook_text?: string
  script_outline?: string
  caption_draft?: string
  hashtags_draft?: string
  sound_name?: string
  sound_url?: string
  inspiration_url?: string
  content_format?: ContentFormat
  hook_type?: HookType
  priority: IdeaPriority
  status: IdeaStatus
  planned_post_at?: string
  filming_due_at?: string
  editing_due_at?: string
  created_at: string
  updated_at: string
  content_pillars?: ContentPillar
}

export interface ContentPost {
  id: string
  creator_profile_id: string
  platform_account_id?: string
  content_idea_id?: string
  content_pillar_id?: string
  title: string
  platform: string
  external_post_id?: string
  post_url?: string
  caption?: string
  hook_text?: string
  content_format?: ContentFormat
  hook_type?: HookType
  video_duration_seconds?: number
  posted_at: string
  used_trending_sound: boolean
  sound_name?: string
  cta_type: CtaType
  thumbnail_note?: string
  creator_confidence_score?: number
  performance_rating?: PerformanceRating
  lesson_learned?: string
  created_at: string
  updated_at: string
  content_pillars?: ContentPillar
  post_metric_snapshots?: PostMetricSnapshot[]
}

export interface PostMetricSnapshot {
  id: string
  content_post_id: string
  snapshot_label: SnapshotLabel
  hours_since_post?: number
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  profile_views: number
  follows_gained: number
  average_watch_time_seconds?: number
  completion_rate?: number
  engagement_rate?: number
  share_rate?: number
  save_rate?: number
  follow_conversion_rate?: number
  created_at: string
}

export interface Experiment {
  id: string
  creator_profile_id: string
  name: string
  hypothesis?: string
  start_date?: string
  end_date?: string
  status: ExperimentStatus
  success_metric?: string
  result_summary?: string
  created_at: string
  updated_at: string
}

// Computed types for insights
export interface InsightData {
  bestPostingHours: { hour: number; avgViews: number }[]
  bestPillar: { name: string; avgEngagement: number; color: string } | null
  bestFormat: { format: string; avgViews: number } | null
  bestHookType: { hookType: string; avgEngagement: number } | null
  winnerPosts: ContentPost[]
  avgEngagementRate: number
  totalFollowersGained: number
  topSaveRate: { title: string; rate: number } | null
}
