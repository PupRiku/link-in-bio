import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./types";

/**
 * Cookie-bound server client (anon / publishable key).
 *
 * Reads the Supabase Auth session from cookies so server components,
 * server actions, and route handlers can identify the logged-in user.
 * RLS still applies — this is NOT a privileged client. Privileged work
 * goes through lib/supabase/admin.ts after an allowlist check.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In a pure Server Component, cookie writes throw — that's fine,
          // the proxy refreshes the session. In actions / route handlers
          // the writes succeed.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore — called from a context where cookies are read-only
          }
        },
      },
    }
  );
}
