-- RIKU link-in-bio — initial schema
-- Mirrors CLAUDE.md §5. Run this first, then seed.sql.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- single-row site config
create table if not exists profile (
  id                  uuid primary key default gen_random_uuid(),
  display_name        text not null default 'RIKU',
  tagline             text default 'madison / chicago',
  current_city        text default 'Madison',      -- drives the status line
  hero_image_url      text,                         -- /riku-hero.jpg or storage URL
  spotify_playlist_url text,                        -- embed/open URL, non-autoplay
  updated_at          timestamptz not null default now()
);

create table if not exists link (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,                        -- "Instagram"
  slug        text unique not null,                 -- "instagram" -> /go/instagram
  url         text not null,                        -- destination
  tier        text not null check (tier in ('public','after_dark')),
  accent      text not null default 'steel'
                check (accent in ('steel','orange','purple','teal','oxblood')),
  icon        text,                                 -- icon/chip key (see CLAUDE.md §8)
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

create table if not exists event (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  venue      text,
  city       text,
  starts_at  date not null,
  ends_at    date,
  url        text,
  blurb      text,
  is_public  boolean not null default true
);

create table if not exists click_event (
  id          bigserial primary key,
  slug        text,                                 -- which link
  link_id     uuid references link(id) on delete set null,
  created_at  timestamptz not null default now(),
  referrer    text,
  user_agent  text,
  country     text                                  -- from request geo header if available
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists link_tier_sort_idx on link (tier, sort_order);
create index if not exists event_starts_at_idx on event (starts_at);
-- helps the Phase 3 analytics dashboard aggregate by link / over time
create index if not exists click_event_link_id_idx on click_event (link_id);
create index if not exists click_event_created_at_idx on click_event (created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Roles: `anon` = unauthenticated visitor, `authenticated` = the single
-- admin user (the only account that will ever log in). The `service_role`
-- key used by the /go redirect route bypasses RLS entirely.
-- ---------------------------------------------------------------------------

alter table profile     enable row level security;
alter table link        enable row level security;
alter table event       enable row level security;
alter table click_event enable row level security;

-- profile: world-readable; only the admin may write.
create policy profile_select_public on profile
  for select using (true);
create policy profile_admin_write on profile
  for all to authenticated using (true) with check (true);

-- link: active rows world-readable; admin sees/writes everything.
create policy link_select_active on link
  for select using (is_active = true);
create policy link_admin_all on link
  for all to authenticated using (true) with check (true);

-- event: public rows world-readable; admin sees/writes everything.
create policy event_select_public on event
  for select using (is_public = true);
create policy event_admin_all on event
  for all to authenticated using (true) with check (true);

-- click_event: no INSERT policy for anon/authenticated, so the only way
-- to write is the service-role redirect route (which bypasses RLS).
-- SELECT is restricted to the admin; the public can never read it.
create policy click_event_select_admin on click_event
  for select to authenticated using (true);
