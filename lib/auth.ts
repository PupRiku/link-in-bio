import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "./supabase/server";

/**
 * Authorization for the admin area.
 *
 * Authenticating with GitHub proves *who* someone is, not that they may
 * enter. Authorization is an allowlist check, done server-side, against
 * ADMIN_EMAILS (comma-separated). If the GitHub identity has no email,
 * fall back to ADMIN_USER_IDS (Supabase auth UUIDs).
 */

function parseList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAllowedUser(user: Pick<User, "id" | "email">): boolean {
  const email = user.email?.toLowerCase();
  const allowedEmails = parseList(process.env.ADMIN_EMAILS).map((e) =>
    e.toLowerCase()
  );
  const allowedIds = parseList(process.env.ADMIN_USER_IDS);

  if (email && allowedEmails.includes(email)) return true;
  if (allowedIds.includes(user.id)) return true;
  return false;
}

/** Returns the validated user, or null if not signed in. */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  // getUser() revalidates the JWT with Supabase — don't trust getSession()
  // for authorization decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Gate for every admin route and mutation. Redirects to /login if not
 * signed in, or to /login?error=forbidden if signed in but not on the
 * allowlist. Returns the user when authorized.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!isAllowedUser(user)) redirect("/login?error=forbidden");
  return user;
}
