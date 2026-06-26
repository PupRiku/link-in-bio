"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

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

const PUBLIC_TILES = [
  { chip: "IG", label: "Instagram", accent: "var(--orange)", delay: ".34s" },
  { chip: "SC", label: "Snapchat", accent: "var(--purple)", delay: ".40s" },
  { chip: "TG", label: "Telegram", accent: "var(--teal)", delay: ".46s" },
];

const AFTER_DARK_TILES = [
  { chip: "SF", label: "Scruff", aria: "Scruff" },
  { chip: "RC", label: "Recon", aria: "Recon" },
  { chip: "AP", label: "Asspig", aria: "Asspig" },
  { chip: "JFF", label: "JFF", aria: "JustForFans" },
  { chip: "X", label: "X", aria: "X" },
  { chip: "BS", label: "Bluesky", aria: "Bluesky" },
];

const EVENTS = [
  { d: "12", m: "Jul", title: "Chicago weekend", sub: "The Eagle · placeholder" },
  { d: "23", m: "Aug", title: "Campit, MI", sub: "glamping · placeholder" },
  { d: "04", m: "Dec", title: "MFF", sub: "programming staff · placeholder" },
];

export default function Home() {
  const [playing, setPlaying] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [bars, setBars] = useState<Bar[]>([]);

  const travelBtnRef = useRef<HTMLButtonElement>(null);
  const travelCloseRef = useRef<HTMLButtonElement>(null);
  const travelTouched = useRef(false);

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
    if (travelOpen) travelCloseRef.current?.focus();
    else travelBtnRef.current?.focus();
  }, [travelOpen]);

  return (
    <main
      className="screen"
      data-playing={playing ? "true" : "false"}
      data-travel={travelOpen ? "open" : "closed"}
    >
      <header className="hero">
        <Image
          className="hero__img"
          src="/riku-hero.jpg"
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
            RIKU
          </h1>
          <p className="tagline rise" style={{ animationDelay: ".18s" }}>
            madison / chicago
          </p>
        </div>
      </header>

      <section className="body">
        <div className="np rise" style={{ animationDelay: ".28s" }}>
          <button
            className="np__toggle"
            aria-pressed={playing}
            aria-label="Play Spotify playlist"
            onClick={() => setPlaying((p) => !p)}
          >
            <span className="np__icon">{playing ? "❚❚" : "▶"}</span>
          </button>
          <div className="np__meta">
            <b>Summer set</b>
            <span>ambient mix · tap to play</span>
          </div>
          <span className="np__tag">Spotify</span>
        </div>

        {PUBLIC_TILES.map((tile) => (
          <a
            key={tile.label}
            className="tile rise"
            style={
              { "--accent": tile.accent, animationDelay: tile.delay } as CSSProperties
            }
            href="#"
            aria-label={tile.label}
          >
            <span className="chip">{tile.chip}</span>
            <span className="tile__label">{tile.label}</span>
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
                {AFTER_DARK_TILES.map((tile) => (
                  <a
                    key={tile.aria}
                    className="tile"
                    href="#"
                    aria-label={tile.aria}
                  >
                    <span className="chip">{tile.chip}</span>
                    <span className="tile__label">{tile.label}</span>
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
          <span className="status__dot" /> currently in Madison
        </div>
      </section>

      <section
        className="travel-panel"
        id="travelPanel"
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
          {EVENTS.map((ev) => (
            <div className="event" key={ev.title}>
              <div className="event__date">
                <div className="d">{ev.d}</div>
                <div className="m">{ev.m}</div>
              </div>
              <div className="event__info">
                <b>{ev.title}</b>
                <span>{ev.sub}</span>
              </div>
            </div>
          ))}
          <p className="tp__note">More dates drop as they firm up.</p>
        </div>
      </section>
    </main>
  );
}
