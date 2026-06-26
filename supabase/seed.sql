-- RIKU link-in-bio — placeholder seed data (mirrors the Phase 1 prototype).
-- Idempotent: safe to re-run. Run after 0001_init.sql.
-- All destination URLs are '#' placeholders until Riku provides real ones.

-- ---------------------------------------------------------------------------
-- profile (single row)
-- ---------------------------------------------------------------------------
insert into profile (display_name, tagline, current_city, hero_image_url, spotify_playlist_url)
select 'RIKU', 'madison / chicago', 'Madison', '/riku-hero.jpg', '#'
where not exists (select 1 from profile);

-- ---------------------------------------------------------------------------
-- links — public tiles catch the club lasers (orange/purple/teal)
-- ---------------------------------------------------------------------------
insert into link (label, slug, url, tier, accent, icon, sort_order, is_active) values
  ('Instagram', 'instagram', '#', 'public', 'orange', 'IG', 0, true),
  ('Snapchat',  'snapchat',  '#', 'public', 'purple', 'SC', 1, true),
  ('Telegram',  'telegram',  '#', 'public', 'teal',   'TG', 2, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- links — after-dark cluster glows oxblood (behind the 18+ gate)
-- ---------------------------------------------------------------------------
insert into link (label, slug, url, tier, accent, icon, sort_order, is_active) values
  ('Scruff',  'scruff',  '#', 'after_dark', 'oxblood', 'SF',  0, true),
  ('Recon',   'recon',   '#', 'after_dark', 'oxblood', 'RC',  1, true),
  ('Asspig',  'asspig',  '#', 'after_dark', 'oxblood', 'AP',  2, true),
  ('JFF',     'jff',     '#', 'after_dark', 'oxblood', 'JFF', 3, true),
  ('X',       'x',       '#', 'after_dark', 'oxblood', 'X',   4, true),
  ('Bluesky', 'bluesky', '#', 'after_dark', 'oxblood', 'BS',  5, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- events — placeholder upcoming travel
-- ---------------------------------------------------------------------------
insert into event (title, venue, city, starts_at, url, blurb, is_public)
select * from (values
  ('Chicago weekend', 'The Eagle',        'Chicago', date '2026-07-12', '#', 'placeholder', true),
  ('Campit, MI',      'glamping',         'Campit',  date '2026-08-23', '#', 'placeholder', true),
  ('MFF',             'programming staff', null,     date '2026-12-04', '#', 'placeholder', true)
) as v(title, venue, city, starts_at, url, blurb, is_public)
where not exists (select 1 from event);
