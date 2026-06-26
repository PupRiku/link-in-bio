import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Low-privilege read client (anon / publishable key).
 *
 * Used from server components to read the publicly-readable rows
 * (profile, active links, public events). RLS still applies, so this
 * key can never see or write anything the policies don't allow.
 *
 * The key is `NEXT_PUBLIC_*`, so this module is safe to import anywhere.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in the environment."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
