import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Full-access admin client (service-role / secret key).
 *
 * Bypasses RLS, so it is the only thing allowed to INSERT into
 * `click_event`. The `server-only` import above makes this module throw
 * at build time if it is ever pulled into a client component, so the
 * secret key can never reach the browser bundle.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
