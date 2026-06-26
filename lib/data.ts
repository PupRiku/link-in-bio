import { supabase } from "./supabase/client";
import type { EventRow, Link, Profile } from "./supabase/types";

/**
 * Read-side data layer for the public page. Every function uses the
 * low-privilege client and relies on RLS to scope rows. Returns typed
 * rows (or null / empty arrays) and never throws on "no data".
 */

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getProfile failed:", error.message);
    return null;
  }
  return data;
}

async function getLinksByTier(tier: Link["tier"]): Promise<Link[]> {
  const { data, error } = await supabase
    .from("link")
    .select("*")
    .eq("tier", tier)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`getLinksByTier(${tier}) failed:`, error.message);
    return [];
  }
  return data ?? [];
}

export function getPublicLinks(): Promise<Link[]> {
  return getLinksByTier("public");
}

export function getAfterDarkLinks(): Promise<Link[]> {
  return getLinksByTier("after_dark");
}

export async function getUpcomingEvents(): Promise<EventRow[]> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from("event")
    .select("*")
    .eq("is_public", true)
    .gte("starts_at", today)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("getUpcomingEvents failed:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Resolve a Spotify playlist's display name via Spotify's public oEmbed
 * endpoint (server-side, so no CORS). Cached for a day so it's not hit per
 * view, but refreshes within 24h if the playlist URL changes. Returns null
 * on empty input or any failure so the caller can fall back.
 */
export async function getSpotifyTitle(
  playlistUrl: string | null | undefined
): Promise<string | null> {
  if (!playlistUrl) return null;
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(playlistUrl)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}
