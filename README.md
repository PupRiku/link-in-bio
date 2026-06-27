# RIKU — link-in-bio

A dark, leather-bar / club-aesthetic link-in-bio site with a private admin and click analytics. Built to be handed out at bars and clubs via link, QR, or tap. Deliberately separate from any professional identity and never indexed.

**Live:** https://riku.gay

---

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind v4**
- **Supabase** — Postgres, Auth (GitHub OAuth), Row Level Security
- **Vercel** — hosting
- Fonts: **Anton** (display), **Oswald** (labels), **Inter** (body)

---

## What it does

**Public page (`/`)** — server-rendered from Supabase:

- Full-bleed graded portrait hero with the RIKU wordmark and a neon "laser" bar that morphs into a music waveform when the Spotify set is playing.
- Ambient Spotify playlist (loads/plays only on tap — never autoplays; title pulled live via Spotify oEmbed, one-tap playback via the Spotify iFrame API).
- Public social tiles (neon accents) and an 18+ "after dark" cluster behind a tap-to-reveal gate (oxblood accents).
- An "Upcoming travel" slide-up panel of events, with optional outbound links.
- A live "currently in {city}" status line.

**Admin (`/admin`)** — GitHub OAuth, restricted to an allowlist:

- CRUD for links, events, and profile.
- Click analytics over `click_event` (totals, 30-day trend, per-link, top referrers, public-vs-after-dark split).
- A Share/QR view that generates an on-brand QR for the public site.

**Attribution** — every tile links through `/go/[slug]`, which logs a `click_event` (referrer, user-agent, country) and then 302-redirects to the real destination. The QR target carries `?ref=qr`.

---

## Architecture notes

- **Reads** use the anon/publishable key under RLS (public can only see active links, public events, and the profile).
- **Privileged reads/writes** (click logging, admin mutations) run server-side via a `server-only` service-role client, after `requireAdmin()` re-verifies the session and allowlist. The service-role key never reaches the client.
- **Auth ≠ authorization:** signing in with GitHub is not enough — the user's email must be in `ADMIN_EMAILS` (or id in `ADMIN_USER_IDS`). Non-allowlisted sign-ins are bounced.
- **noindex everywhere:** `robots` metadata, an `X-Robots-Tag` response header, and `robots.txt` all disallow crawling.
- Origin is resolved at runtime (forwarded headers → `NEXT_PUBLIC_SITE_URL` → localhost), so the same build works on the `*.vercel.app` URL and the custom domain with no code change.

---

## Data model (Supabase)

- `profile` — single row: display name, tagline, current city, hero image, Spotify playlist URL.
- `link` — label, slug, url, tier (`public` | `after_dark`), accent, icon, sort order, active.
- `event` — title, venue, city, start/end dates, url, blurb, public flag.
- `click_event` — slug, link id, timestamp, referrer, user-agent, country.

RLS: public SELECT on active/public rows only; `click_event` insert via service role, select by admin only; no public writes anywhere.

See `supabase/migrations/` for the schema and `supabase/seed.sql` for seed content.

---

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                         # http://localhost:3000
```

### Environment variables

| Variable                        | Notes                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key — client-safe, RLS applies                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Secret / service-role key — **server-only, never prefix with `NEXT_PUBLIC_`** |
| `ADMIN_EMAILS`                  | Comma-separated allowlist of admin emails                                     |
| `ADMIN_USER_IDS`                | (optional) Supabase auth UUID fallback when the GitHub identity has no email  |
| `NEXT_PUBLIC_SITE_URL`          | Canonical site URL (e.g. `https://riku.gay`) used as an origin fallback       |

`.env.local` is gitignored; only `.env.local.example` (placeholders) is committed.

### Database setup

Run the SQL in `supabase/migrations/` then `supabase/seed.sql` in the Supabase SQL editor (or via the Supabase CLI).

### Auth setup

Enable GitHub as an OAuth provider in Supabase, create a GitHub OAuth app whose callback points at Supabase's `/auth/v1/callback`, and add your site's `/auth/callback` to Supabase → Authentication → URL Configuration → Redirect URLs (one entry per environment).

---

## Deployment (Vercel)

1. Import the repo into Vercel.
2. Add the env vars above for Production (and Preview). Keep `SUPABASE_SERVICE_ROLE_KEY` un-prefixed.
3. Deploy, then set `NEXT_PUBLIC_SITE_URL` to the production URL and redeploy.
4. Add the production `/auth/callback` to Supabase's Redirect URLs and set the Site URL.

Custom domain: add it in Vercel → Domains, set the DNS records Vercel provides at the registrar, then update `NEXT_PUBLIC_SITE_URL` and the Supabase URL config to the new domain. The GitHub OAuth app callback does not change (it points at Supabase).

---

## Project layout

```
app/
  page.tsx              public link-in-bio
  go/[slug]/route.ts    click logging + redirect
  login/                GitHub sign-in
  auth/callback/        OAuth callback (verifies allowlist)
  admin/                gated admin: dashboard, links, events, profile, analytics, share
  robots.ts
lib/
  supabase/             server (anon) + admin (service-role, server-only) clients
  auth.ts               requireAdmin()
  data.ts               typed data access
  site-url.ts           runtime origin resolution
supabase/
  migrations/           schema + RLS
  seed.sql
reference/              static design prototypes (public + admin)
public/                 hero image, og image, assets
```

---

## Conventions

- The visual design is locked to the prototypes in `reference/`. Match the palette and the Anton / Oswald / Inter type system.
- **Zone-color rule:** public = neon (orange / purple / teal); after-dark = oxblood. This carries into the admin (badges, bars, dots).
- Motion respects `prefers-reduced-motion`.
- Admin changes call `revalidatePath('/')` so the public page updates immediately.

---

_Private project. Not for indexing or redistribution._
