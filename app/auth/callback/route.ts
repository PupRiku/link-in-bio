import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAllowedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GitHub redirects here with ?code=...; exchange it for a session (which
// sets the auth cookies), then send the user into /admin. If the code is
// missing or the signed-in identity isn't on the allowlist, bounce to
// /login with an error.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedUser(user)) {
    // Authenticated but not authorized — drop the session and bounce.
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=forbidden", origin));
  }

  return NextResponse.redirect(new URL("/admin", origin));
}
