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
