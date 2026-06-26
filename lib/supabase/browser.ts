import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

/**
 * Browser client (anon / publishable key) for the client-side login
 * button only. It can start the GitHub OAuth flow; it is never used for
 * privileged reads or writes.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
