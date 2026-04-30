
-- ENUMS
create type public.deal_priority as enum ('High', 'Medium', 'Low');
create type public.deal_status as enum ('New', 'Researching', 'First call completed', 'Follow-up needed', 'Partner review', 'Passed', 'Tracking');
create type public.deal_stage as enum ('Pre-seed', 'Seed', 'Series A', 'Series B', 'Later');
create type public.note_source as enum ('hubspot', 'granola', 'manual');
create type public.note_status as enum ('unprocessed', 'analyzed', 'needs_review');
create type public.insight_type as enum ('trend', 'crowded_market', 'whitespace', 'similar_alert', 'follow_up', 'missing_competitor');
create type public.followup_status as enum ('open', 'answered', 'dismissed');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to auto-create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- MARKET SEGMENTS
create table public.market_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  crowdedness_score int not null default 50,
  opportunity_score int not null default 50,
  trend text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.market_segments enable row level security;
create policy "Segments owner select" on public.market_segments for select using (auth.uid() = user_id);
create policy "Segments owner insert" on public.market_segments for insert with check (auth.uid() = user_id);
create policy "Segments owner update" on public.market_segments for update using (auth.uid() = user_id);
create policy "Segments owner delete" on public.market_segments for delete using (auth.uid() = user_id);
create trigger market_segments_set_updated before update on public.market_segments for each row execute function public.set_updated_at();
create index on public.market_segments(user_id);

-- STARTUPS
create table public.startups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  founder text,
  stage public.deal_stage,
  segment_id uuid references public.market_segments(id) on delete set null,
  target_customer text,
  summary text,
  differentiation text,
  status public.deal_status not null default 'New',
  priority public.deal_priority not null default 'Medium',
  source public.note_source,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.startups enable row level security;
create policy "Startups owner select" on public.startups for select using (auth.uid() = user_id);
create policy "Startups owner insert" on public.startups for insert with check (auth.uid() = user_id);
create policy "Startups owner update" on public.startups for update using (auth.uid() = user_id);
create policy "Startups owner delete" on public.startups for delete using (auth.uid() = user_id);
create trigger startups_set_updated before update on public.startups for each row execute function public.set_updated_at();
create index on public.startups(user_id);
create index on public.startups(segment_id);

-- NOTES
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  startup_id uuid references public.startups(id) on delete set null,
  source public.note_source not null default 'manual',
  title text,
  raw_text text not null,
  status public.note_status not null default 'unprocessed',
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "Notes owner select" on public.notes for select using (auth.uid() = user_id);
create policy "Notes owner insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "Notes owner update" on public.notes for update using (auth.uid() = user_id);
create policy "Notes owner delete" on public.notes for delete using (auth.uid() = user_id);
create index on public.notes(user_id);
create index on public.notes(startup_id);

-- ANALYSES
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  startup_id uuid references public.startups(id) on delete cascade,
  note_id uuid references public.notes(id) on delete set null,
  ai_summary text,
  risk_signals text[] default '{}',
  opportunity_signals text[] default '{}',
  created_at timestamptz not null default now()
);
alter table public.analyses enable row level security;
create policy "Analyses owner select" on public.analyses for select using (auth.uid() = user_id);
create policy "Analyses owner insert" on public.analyses for insert with check (auth.uid() = user_id);
create policy "Analyses owner update" on public.analyses for update using (auth.uid() = user_id);
create policy "Analyses owner delete" on public.analyses for delete using (auth.uid() = user_id);
create index on public.analyses(startup_id);

-- COMPETITORS
create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  name text not null,
  relationship_type text,
  description text,
  created_at timestamptz not null default now()
);
alter table public.competitors enable row level security;
create policy "Competitors owner select" on public.competitors for select using (auth.uid() = user_id);
create policy "Competitors owner insert" on public.competitors for insert with check (auth.uid() = user_id);
create policy "Competitors owner update" on public.competitors for update using (auth.uid() = user_id);
create policy "Competitors owner delete" on public.competitors for delete using (auth.uid() = user_id);
create index on public.competitors(startup_id);

-- FOLLOW UP QUESTIONS
create table public.follow_up_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  question text not null,
  priority public.deal_priority not null default 'Medium',
  status public.followup_status not null default 'open',
  created_at timestamptz not null default now()
);
alter table public.follow_up_questions enable row level security;
create policy "Followups owner select" on public.follow_up_questions for select using (auth.uid() = user_id);
create policy "Followups owner insert" on public.follow_up_questions for insert with check (auth.uid() = user_id);
create policy "Followups owner update" on public.follow_up_questions for update using (auth.uid() = user_id);
create policy "Followups owner delete" on public.follow_up_questions for delete using (auth.uid() = user_id);
create index on public.follow_up_questions(startup_id);

-- INSIGHTS
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  startup_id uuid references public.startups(id) on delete cascade,
  segment_id uuid references public.market_segments(id) on delete cascade,
  type public.insight_type not null,
  title text not null,
  content text,
  confidence_score int not null default 70,
  recommended_action text,
  created_at timestamptz not null default now()
);
alter table public.insights enable row level security;
create policy "Insights owner select" on public.insights for select using (auth.uid() = user_id);
create policy "Insights owner insert" on public.insights for insert with check (auth.uid() = user_id);
create policy "Insights owner update" on public.insights for update using (auth.uid() = user_id);
create policy "Insights owner delete" on public.insights for delete using (auth.uid() = user_id);
create index on public.insights(user_id);
