"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { EventRow, Link, Profile } from "@/lib/supabase/types";
import { ChipContent } from "./_components/platform-icons";
import SpotifyPlayer, {
  type SpotifyPlayerHandle,
} from "./_components/SpotifyPlayer";

// Pull the playlist id from a saved Spotify URL/URI. Returns null if absent
// (the ambient bar is hidden in that case).
function spotifyPlaylistId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/playlist[/:]([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

type Bar = {
  color: string;
  opacity: number;
  style: CSSProperties;
  delay: string;
};

const RAMP = ["#FF7A1A", "#A855F7", "#2DD4BF"] as const;
const hx = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const mix = (a: string, b: string, t: number) => {
  const A = hx(a);
  const B = hx(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(
    A[1] + (B[1] - A[1]) * t
  )},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Format a 'YYYY-MM-DD' date string without going through Date(), to avoid
// any timezone shift on the day/month shown in the travel panel.
function formatEventDate(starts_at: string): { d: string; m: string } {
  const [, month, day] = starts_at.split("-");
  const monthIdx = Math.max(0, Math.min(11, Number(month) - 1));
  return { d: (day ?? "").padStart(2, "0"), m: MONTHS[monthIdx] };
}

function eventSubtitle(ev: EventRow): string {
  return [ev.venue, ev.blurb].filter(Boolean).join(" · ");
}

export default function RikuPage({
  profile,
  publicLinks,
  afterDarkLinks,
  events,
  spotifyTitle,
}: {
  profile: Profile;
  publicLinks: Link[];
  afterDarkLinks: Link[];
  events: EventRow[];
  spotifyTitle?: string | null;
}) {
  // `playing` reflects REAL playback state reported by the Spotify controller
  // (it also drives the simulated hero waveform via data-playing). `spotifyOn`
  // tracks whether the player has been mounted (first tap onward).
  const [playing, setPlaying] = useState(false);
  const [spotifyOn, setSpotifyOn] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [bars, setBars] = useState<Bar[]>([]);

  const travelBtnRef = useRef<HTMLButtonElement>(null);
  const travelCloseRef = useRef<HTMLButtonElement>(null);
  const travelPanelRef = useRef<HTMLElement>(null);
  const travelTouched = useRef(false);
  const playerRef = useRef<SpotifyPlayerHandle>(null);

  // Build the simulated 64-bar waveform on the client (uses Math.random,
  // so it must run post-mount to avoid a hydration mismatch).
  useEffect(() => {
    const N = 64;
    const next: Bar[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      next.push({
        color:
          t < 0.5
            ? mix(RAMP[0], RAMP[1], t / 0.5)
            : mix(RAMP[1], RAMP[2], (t - 0.5) / 0.5),
        opacity: Number(
          (0.2 + 0.8 * Math.min(1, Math.min(i, N - 1 - i) / 6)).toFixed(2)
        ),
        style: {
          "--peak": (1.6 + Math.random() * 2.6).toFixed(2),
          "--dur": (520 + Math.random() * 620).toFixed(0) + "ms",
        } as CSSProperties,
        delay: (-Math.random() * 900).toFixed(0) + "ms",
      });
    }
    setBars(next);
  }, []);

  // Escape closes the travel panel; focus follows the panel open/close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && travelOpen) setTravelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [travelOpen]);

  useEffect(() => {
    // Don't grab focus on first render; only mirror the prototype's
    // open/close focus handoff after the user has interacted.
    if (!travelTouched.current) {
      travelTouched.current = true;
      return;
    }
    if (travelOpen) {
      travelCloseRef.current?.focus();
      // Reset to the top so the panel reads as a fresh page: both the window
      // and the panel's own scroll container. Honor reduced-motion (instant).
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
      if (travelPanelRef.current) travelPanelRef.current.scrollTop = 0;
    } else {
      travelBtnRef.current?.focus();
    }
  }, [travelOpen]);

  const heroSrc = profile.hero_image_url || "/riku-hero.jpg";
  const playlistId = spotifyPlaylistId(profile.spotify_playlist_url);
  const spotifyUri = playlistId ? `spotify:playlist:${playlistId}` : null;

  // First tap mounts the player (which auto-plays); later taps toggle the
  // existing controller. State flows back from the controller's events.
  function handleSpotifyToggle() {
    if (!spotifyOn) {
      setSpotifyOn(true);
      return;
    }
    playerRef.current?.toggle();
  }

  return (
    <main
      className="screen"
      data-playing={playing ? "true" : "false"}
      data-travel={travelOpen ? "open" : "closed"}
    >
      <header className="hero">
        <Image
          className="hero__img"
          src={heroSrc}
          alt=""
          fill
          sizes="440px"
          priority
        />
        <div className="hero__fade" />
        <div className="laser laser--1" />
        <div className="laser laser--2" />
        <div className="wave" aria-hidden="true">
          {bars.map((bar, i) => (
            <b
              key={i}
              style={{
                ...bar.style,
                color: bar.color,
                opacity: bar.opacity,
                animationDelay: bar.delay,
              }}
            />
          ))}
        </div>
        <div className="hero__content">
          <h1 className="wordmark rise" style={{ animationDelay: ".08s" }}>
            {profile.display_name}
          </h1>
          {profile.tagline ? (
            <p className="tagline rise" style={{ animationDelay: ".18s" }}>
              {profile.tagline}
            </p>
          ) : null}
        </div>
      </header>

      <section className="body">
        {spotifyUri ? (
          <>
            <div className="np rise" style={{ animationDelay: ".28s" }}>
              <button
                className="np__toggle"
                aria-pressed={playing}
                aria-label={
                  playing ? "Pause playlist" : "Play Spotify playlist"
                }
                onClick={handleSpotifyToggle}
              >
                <span className="np__icon">{playing ? "❚❚" : "▶"}</span>
              </button>
              <div className="np__meta">
                <b>{spotifyTitle || "Ambient set"}</b>
                <span>{playing ? "now playing · Spotify" : "tap to play"}</span>
              </div>
              <span className="np__tag">Spotify</span>
            </div>
            {/* The player (script + controller + iframe) mounts only after the
                first tap — nothing loads or plays before then. The hero
                waveform stays simulated (the embed exposes no audio data) and
                is switched on/off by the controller's real playback events. */}
            {spotifyOn ? (
              <SpotifyPlayer
                ref={playerRef}
                uri={spotifyUri}
                onPlayingChange={setPlaying}
              />
            ) : null}
          </>
        ) : null}

        {publicLinks.map((link, i) => (
          <a
            key={link.id}
            className="tile rise"
            style={
              {
                "--accent": `var(--${link.accent})`,
                animationDelay: `${(0.34 + i * 0.06).toFixed(2)}s`,
              } as CSSProperties
            }
            href={`/go/${link.slug}`}
            aria-label={link.label}
          >
            <span className="chip">
              <ChipContent icon={link.icon} label={link.label} />
            </span>
            <span className="tile__label">{link.label}</span>
            <span className="tile__arrow">&rsaquo;</span>
          </a>
        ))}

        <div className="gate-wrap" data-open={gateOpen ? "true" : "false"}>
          <button
            className="gate"
            aria-expanded={gateOpen}
            aria-controls="afterdark"
            onClick={() => setGateOpen((o) => !o)}
          >
            <span className="pill">18+</span>
            <span className="gate__text">
              {gateOpen ? "After dark" : "Tap to reveal · after dark"}
            </span>
            <span className="gate__sign">+</span>
          </button>
          <div className="reveal" id="afterdark">
            <div>
              <div className="afterdark afterdark-inner">
                {afterDarkLinks.map((link) => (
                  <a
                    key={link.id}
                    className="tile"
                    href={`/go/${link.slug}`}
                    aria-label={link.label}
                  >
                    <span className="chip">
                      <ChipContent icon={link.icon} label={link.label} />
                    </span>
                    <span className="tile__label">{link.label}</span>
                    <span className="tile__arrow">&rsaquo;</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="travel-wrap" data-open={travelOpen ? "true" : "false"}>
          <button
            className="travel"
            ref={travelBtnRef}
            aria-expanded={travelOpen}
            aria-controls="travelPanel"
            onClick={() => setTravelOpen(true)}
          >
            <span className="chip">TR</span>
            <span className="travel__t">
              <b>Upcoming travel</b>
              <span>where to find me next</span>
            </span>
            <span className="travel__arrow">&rsaquo;</span>
          </button>
        </div>

        <div className="status">
          <span className="status__dot" /> currently in{" "}
          {profile.current_city || "Madison"}
        </div>
      </section>

      <section
        className="travel-panel"
        id="travelPanel"
        ref={travelPanelRef}
        aria-hidden={!travelOpen}
        aria-label="Upcoming travel"
      >
        <div className="tp__laser" />
        <header className="tp__head">
          <button
            className="tp__back"
            ref={travelCloseRef}
            aria-label="Back to links"
            onClick={() => setTravelOpen(false)}
          >
            &lsaquo;
          </button>
          <h2 className="tp__title">Upcoming travel</h2>
        </header>
        <div className="tp__body">
          {events.map((ev) => {
            const { d, m } = formatEventDate(ev.starts_at);
            return (
              <div className="event" key={ev.id}>
                <div className="event__date">
                  <div className="d">{d}</div>
                  <div className="m">{m}</div>
                </div>
                <div className="event__info">
                  <b>{ev.title}</b>
                  <span>{eventSubtitle(ev)}</span>
                </div>
              </div>
            );
          })}
          <p className="tp__note">More dates drop as they firm up.</p>
        </div>
      </section>
    </main>
  );
}
