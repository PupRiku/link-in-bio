# RIKU - link-in-bio: build spec

A dark, leather-bar / gritty-club link-in-bio site for "Riku." Separate from any professional identity, never indexed, never cross-linked to a real-name site. This document is the build brief; `riku-links.html` is the **visual source of truth**.

---

## 0. Handoff assets

- `riku-links.html` - working prototype. The palette, type, layout, components, motion, and the home-screen markup all live here. **Port from this exactly**; it is the design spec.
- `riku-hero.jpg` - the graded hero portrait (oxblood monochrome, faded to black at the bottom). Drop in `/public`. The prototype currently embeds it as a data URI; replace with this file.

---

## 1. What it is

A single public page that someone reaches by tapping a link, scanning a QR, or NFC at a bar/club. It shows:

- A full-bleed graded portrait hero with the **RIKU** wordmark and a neon "laser" light bar.
- An ambient Spotify control under the hero (does **not** autoplay).
- Public social tiles.
- An 18+ "after dark" cluster behind a tap-to-reveal gate.
- An "Upcoming travel" button that opens a second-page panel of events.
- A live "currently in [city]" status line.

Plus a private admin area for Riku to manage links/events and view click analytics.

---

## 2. Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind v4** (match the prototype tokens below)
- **Supabase** - Postgres (data), Auth (single admin user), RLS
- **Vercel** - hosting
- Fonts: **Anton**, **Oswald**, **Inter** (Google Fonts)

If the repo isn't scaffolded yet, step one is `create-next-app` (App Router, TS, Tailwind). If it is, build on it.

---

## 3. Design tokens (from the prototype)

```
--base:        #0A0A0B   near-black page
--charc:       #16131A   raised surface
--tile:        #15121A   tile bg
--tile-edge:   #2A2E35   tile hairline
--oxblood:     #6E0B14   after-dark base
--oxblood-live:#A11020   after-dark accent
--oxblood-soft:#E2B6BC   after-dark text
--steel:       #C2C7CD
--mute:        #6E7177
--bone:        #EDE9E3   primary text
--orange:      #FF7A1A   laser / accent
--purple:      #A855F7   laser / accent
--teal:        #2DD4BF   laser / accent / status
spotify green: #1ED760
```

Type roles: **Anton** = wordmark + panel titles. **Oswald** (500/600, uppercase, tracked) = eyebrows, section labels, status. **Inter** (400/500) = body, tile labels.

Motion (all respect `prefers-reduced-motion`): idle laser drift; tile hover/focus "ignite" (neon border + glow + chevron slide); after-dark accordion (`grid-template-rows: 0fr -> 1fr`); travel slide-up panel (`translateY(100%) -> 0`); on play, lasers fade out and a 64-bar neon waveform animates in.

**Zone color rule:** public tiles catch the club lasers (orange/purple/teal); the after-dark cluster glows oxblood ("red-light"). Keep this.

---

## 4. Information architecture

Hero -> ambient Spotify bar -> public tiles -> after-dark gate (collapsed) -> travel button -> status line. Travel opens as a full slide-up second page.

**Public tiles:** Instagram, Snapchat, Telegram
**After-dark (behind 18+ gate):** Scruff, Recon, Asspig, JFF, X, Bluesky
**Ambient:** Spotify playlist
**Travel:** events list (second page)

All link targets, handles, and the Spotify playlist are placeholders in the prototype - real values come from the DB (section 5) / Riku.

---

## 5. Data model (Supabase)

```sql
-- single-row site config
profile (
  id uuid pk default gen_random_uuid(),
  display_name text default 'RIKU',
  tagline text default 'madison / chicago',
  current_city text default 'Madison',     -- drives status line
  hero_image_url text,                      -- /riku-hero.jpg or storage
  spotify_playlist_url text,                -- embed/open URL, non-autoplay
  updated_at timestamptz default now()
);

link (
  id uuid pk default gen_random_uuid(),
  label text not null,                      -- "Instagram"
  slug text unique not null,                -- "instagram" -> /go/instagram
  url text not null,                        -- destination
  tier text not null check (tier in ('public','after_dark')),
  accent text default 'steel',              -- orange|purple|teal|oxblood
  icon text,                                -- icon key (see section 8)
  sort_order int not null default 0,
  is_active boolean not null default true
);

event (
  id uuid pk default gen_random_uuid(),
  title text not null,
  venue text,
  city text,
  starts_at date not null,
  ends_at date,
  url text,
  blurb text,
  is_public boolean not null default true
);

click_event (
  id bigserial pk,
  slug text,                                -- which link
  link_id uuid references link(id),
  created_at timestamptz default now(),
  referrer text,
  user_agent text,
  country text                             -- from request geo header if available
);
```

RLS: `profile`, `link`, `event` are publicly **readable** (active/public rows only); writes restricted to the admin user. `click_event` is insert-only from the redirect route (service role), readable only by admin.

---

## 6. Routes

- `/` - the public page. Server-render profile + active links + public events from Supabase. Port the prototype's markup/CSS/interactions 1:1.
- `/go/[slug]` - look up the link, insert a `click_event` (slug, referrer, user-agent, geo), then 302 to `link.url`. **All tiles link through `/go/...`, never directly**, so every tap is attributable. (Use this for the QR target too.)
- `/admin` - auth-gated (Supabase Auth, single user). Manage profile, links (reorder, tier, accent, active), and events. Analytics dashboard reading `click_event`: clicks per link, over time, by referrer, public vs after-dark split.

---

## 7. Analytics

The `/go/[slug]` redirect is the logging point. Dashboard aggregates: total taps, taps per link, trend over time, top referrers, and the public-vs-after-dark breakdown. Keep logging lightweight and privacy-respecting - no third-party trackers, no PII beyond coarse request metadata. The after-dark links are sensitive; don't expose their analytics anywhere public.

---

## 8. Notes that bite if missed

- **Spotify never autoplays.** Ambient bar is user-initiated. For real audio, the official Spotify embed stays silent until tapped; it will **not** expose raw audio data, so the reactive waveform can't read real playback. Ship the **simulated** 64-bar waveform from the prototype first. A later "real" version would run a Web Audio `AnalyserNode` over a short preview clip, not the Spotify embed.
- **noindex everywhere.** `<meta name="robots" content="noindex,nofollow">`, `X-Robots-Tag: noindex` header, a `robots.txt` disallow, and **no** canonical or backlink to any real-name/professional site. This is the whole point of keeping it separate.
- **Icons:** the prototype uses initial chips (IG, SC, TG...) as placeholders. Swap for clean icons (e.g. `simple-icons`) per platform, keeping the steel-chip frame.
- **Tap-to-reveal + slide-up panel** are core UX, not decoration - keep both behaviors from the prototype.
- **Hero grading** (if Riku reshoots): resize, oxblood duotone LUT (shadows -> deep oxblood, mids -> maroon, highs -> warm bone), bottom fade to `--base`, mild vignette. Current asset is `riku-hero.jpg`.
- QR generation for the printed/NFC handoff can live in `/admin` (points at the site root or a tagged `/go/...`).

---

## 9. What Riku still needs to provide

- Supabase project URL + anon + service-role keys (`.env.local`)
- The domain (separate, not a subdomain of any real-name site)
- Real handles/URLs per platform; the Spotify playlist URL
- Real event data
- High-res hero (optional; `riku-hero.jpg` works for launch)

---

## 10. Suggested build order

1. **Static port** - rebuild the prototype as the Next.js `/` page: tokens, fonts, hero + waveform, tiles, gate, travel panel, status. Pixel-match `riku-links.html`.
2. **Data-driven** - Supabase schema + seed; render profile/links/events from the DB; tiles route through `/go/[slug]`.
3. **Redirect + admin** - `/go` click logging; `/admin` auth, CRUD, analytics dashboard.
4. **Polish + ship** - real icons, real Spotify embed, QR generation, optional real-preview waveform, deploy to Vercel with noindex headers.

---

## First prompt to give Claude Code

> Read `riku-links.html` and this spec (`riku-links-spec.md`). Phase 1: port the prototype's home screen into this Next.js App Router + Tailwind v4 project as the `/` route - same palette, fonts (Anton/Oswald/Inter), full-bleed hero using `/public/riku-hero.jpg`, the neon laser + simulated waveform, the public tiles, the after-dark tap-to-reveal gate, the slide-up travel panel, and the status line. Match `riku-links.html` exactly; keep all interactions and `prefers-reduced-motion` support. Don't wire Supabase yet - hardcode the current placeholder content. Show me the page, then we'll do Phase 2.
