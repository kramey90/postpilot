-- PostPilot Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS (handled by Supabase Auth)
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
-- CREATOR PROFILES
-- ─────────────────────────────────────────
create table creator_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text not null,
  niche text,
  bio text,
  primary_goal text check (primary_goal in ('grow_followers','increase_engagement','drive_sales','get_brand_deals','build_community')),
  target_audience text,
  current_follower_count integer default 0,
  monetization_goal text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- PLATFORM ACCOUNTS
-- ─────────────────────────────────────────
create table platform_accounts (
  id uuid primary key default uuid_generate_v4(),
  creator_profile_id uuid references creator_profiles(id) on delete cascade not null,
  platform text not null default 'tiktok',
  handle text,
  profile_url text,
  external_account_id text,
  is_connected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- CONTENT PILLARS
-- ─────────────────────────────────────────
create table content_pillars (
  id uuid primary key default uuid_generate_v4(),
  creator_profile_id uuid references creator_profiles(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#fe2c55',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- CONTENT IDEAS
-- ─────────────────────────────────────────
create table content_ideas (
  id uuid primary key default uuid_generate_v4(),
  creator_profile_id uuid references creator_profiles(id) on delete cascade not null,
  content_pillar_id uuid references content_pillars(id) on delete set null,
  title text not null,
  idea_notes text,
  hook_text text,
  script_outline text,
  caption_draft text,
  hashtags_draft text,
  sound_name text,
  sound_url text,
  inspiration_url text,
  content_format text check (content_format in ('storytime','grwm','haul','tutorial','day_in_the_life','before_after','trend_remix','talking_head','voiceover','product_review','listicle','response_video')),
  hook_type text check (hook_type in ('question','hot_take','relatable_problem','curiosity_gap','confession','before_after','mistake','story_opener','direct_value','controversial_opinion')),
  priority text check (priority in ('low','medium','high','must_post')) default 'medium',
  status text check (status in ('idea','planned','scripted','filmed','editing','ready_to_post','posted','scrapped')) default 'idea',
  planned_post_at timestamptz,
  filming_due_at timestamptz,
  editing_due_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- CONTENT POSTS
-- ─────────────────────────────────────────
create table content_posts (
  id uuid primary key default uuid_generate_v4(),
  creator_profile_id uuid references creator_profiles(id) on delete cascade not null,
  platform_account_id uuid references platform_accounts(id) on delete set null,
  content_idea_id uuid references content_ideas(id) on delete set null,
  content_pillar_id uuid references content_pillars(id) on delete set null,
  title text not null,
  platform text default 'tiktok',
  external_post_id text,
  post_url text,
  caption text,
  hook_text text,
  content_format text,
  hook_type text,
  video_duration_seconds integer,
  posted_at timestamptz not null,
  used_trending_sound boolean default false,
  sound_name text,
  sound_url text,
  cta_type text check (cta_type in ('none','follow','comment','save','share','link_in_bio','shop_product','watch_part_two')) default 'none',
  thumbnail_note text,
  creator_confidence_score integer check (creator_confidence_score between 1 and 10),
  performance_rating text check (performance_rating in ('flop','normal','good','winner','viral')),
  lesson_learned text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- POST METRIC SNAPSHOTS
-- ─────────────────────────────────────────
create table post_metric_snapshots (
  id uuid primary key default uuid_generate_v4(),
  content_post_id uuid references content_posts(id) on delete cascade not null,
  snapshot_label text not null, -- '1h', '3h', '24h', '48h', '7d', '30d'
  hours_since_post numeric,
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  profile_views integer default 0,
  follows_gained integer default 0,
  average_watch_time_seconds numeric,
  completion_rate numeric,
  -- calculated on insert via trigger or app layer
  engagement_rate numeric,
  share_rate numeric,
  save_rate numeric,
  follow_conversion_rate numeric,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- HASHTAGS
-- ─────────────────────────────────────────
create table hashtags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz default now()
);

create table post_hashtags (
  id uuid primary key default uuid_generate_v4(),
  content_post_id uuid references content_posts(id) on delete cascade not null,
  hashtag_id uuid references hashtags(id) on delete cascade not null,
  unique(content_post_id, hashtag_id)
);

-- ─────────────────────────────────────────
-- EXPERIMENTS
-- ─────────────────────────────────────────
create table experiments (
  id uuid primary key default uuid_generate_v4(),
  creator_profile_id uuid references creator_profiles(id) on delete cascade not null,
  name text not null,
  hypothesis text,
  start_date date,
  end_date date,
  status text check (status in ('planned','running','completed','abandoned')) default 'planned',
  success_metric text,
  result_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table experiment_posts (
  id uuid primary key default uuid_generate_v4(),
  experiment_id uuid references experiments(id) on delete cascade not null,
  content_post_id uuid references content_posts(id) on delete cascade not null,
  unique(experiment_id, content_post_id)
);

-- ─────────────────────────────────────────
-- MONETIZATION EVENTS
-- ─────────────────────────────────────────
create table monetization_events (
  id uuid primary key default uuid_generate_v4(),
  creator_profile_id uuid references creator_profiles(id) on delete cascade not null,
  content_post_id uuid references content_posts(id) on delete set null,
  type text check (type in ('creator_fund','affiliate_sale','brand_deal','gift','shop_commission','other')) not null,
  amount numeric(10,2),
  brand_name text,
  affiliate_platform text,
  product_name text,
  notes text,
  event_date date not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table creator_profiles enable row level security;
alter table platform_accounts enable row level security;
alter table content_pillars enable row level security;
alter table content_ideas enable row level security;
alter table content_posts enable row level security;
alter table post_metric_snapshots enable row level security;
alter table experiments enable row level security;
alter table experiment_posts enable row level security;
alter table monetization_events enable row level security;

-- Creator profiles: users own their own profiles
create policy "Users can CRUD their own creator profiles"
  on creator_profiles for all
  using (auth.uid() = user_id);

-- All child tables: access through creator_profile ownership
create policy "Access platform_accounts via profile"
  on platform_accounts for all
  using (creator_profile_id in (
    select id from creator_profiles where user_id = auth.uid()
  ));

create policy "Access content_pillars via profile"
  on content_pillars for all
  using (creator_profile_id in (
    select id from creator_profiles where user_id = auth.uid()
  ));

create policy "Access content_ideas via profile"
  on content_ideas for all
  using (creator_profile_id in (
    select id from creator_profiles where user_id = auth.uid()
  ));

create policy "Access content_posts via profile"
  on content_posts for all
  using (creator_profile_id in (
    select id from creator_profiles where user_id = auth.uid()
  ));

create policy "Access post_metric_snapshots via post"
  on post_metric_snapshots for all
  using (content_post_id in (
    select id from content_posts where creator_profile_id in (
      select id from creator_profiles where user_id = auth.uid()
    )
  ));

create policy "Access experiments via profile"
  on experiments for all
  using (creator_profile_id in (
    select id from creator_profiles where user_id = auth.uid()
  ));

create policy "Access experiment_posts via experiment"
  on experiment_posts for all
  using (experiment_id in (
    select id from experiments where creator_profile_id in (
      select id from creator_profiles where user_id = auth.uid()
    )
  ));

create policy "Access monetization_events via profile"
  on monetization_events for all
  using (creator_profile_id in (
    select id from creator_profiles where user_id = auth.uid()
  ));

-- Hashtags are public read, restricted write
create policy "Anyone can read hashtags" on hashtags for select using (true);
create policy "Authenticated users can insert hashtags" on hashtags for insert with check (auth.role() = 'authenticated');

create policy "Access post_hashtags via post"
  on post_hashtags for all
  using (content_post_id in (
    select id from content_posts where creator_profile_id in (
      select id from creator_profiles where user_id = auth.uid()
    )
  ));

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on creator_profiles for each row execute function handle_updated_at();
create trigger set_updated_at before update on platform_accounts for each row execute function handle_updated_at();
create trigger set_updated_at before update on content_pillars for each row execute function handle_updated_at();
create trigger set_updated_at before update on content_ideas for each row execute function handle_updated_at();
create trigger set_updated_at before update on content_posts for each row execute function handle_updated_at();
create trigger set_updated_at before update on experiments for each row execute function handle_updated_at();
