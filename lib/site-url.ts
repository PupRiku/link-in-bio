import "server-only";

import { headers } from "next/headers";

/**
 * Resolve the public site origin server-side, in priority order:
 *   1. the incoming request's forwarded host (correct behind Vercel's proxy),
 *   2. the NEXT_PUBLIC_SITE_URL env fallback,
 *   3. localhost for local dev.
 * Never hardcodes a deploy URL, so QR targets / OAuth links follow the real
 * runtime origin.
 */
export function originFromHeaders(h: Headers): string {
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  return env ? env.replace(/\/+$/, "") : "http://localhost:3000";
}

export async function getSiteOrigin(): Promise<string> {
  return originFromHeaders(await headers());
}
