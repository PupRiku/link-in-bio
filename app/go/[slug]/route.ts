import { NextResponse, type NextRequest } from "next/server";

import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Always run per-request: we read headers and log a click on every hit.
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/go/[slug]">
) {
  const { slug } = await ctx.params;
  const home = new URL("/", request.url);

  // Look up the active link (RLS only exposes active rows to the anon key).
  const { data: link } = await supabase
    .from("link")
    .select("id, url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!link) {
    return NextResponse.redirect(home, 302);
  }

  // Log the tap via the service role (the only writer allowed by RLS).
  // Never let a logging failure block the redirect.
  try {
    await supabaseAdmin.from("click_event").insert({
      slug,
      link_id: link.id,
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
      country: request.headers.get("x-vercel-ip-country"),
    });
  } catch (err) {
    console.error("click_event insert failed:", err);
  }

  // Redirect to the destination if it's a valid absolute URL; otherwise
  // (e.g. the '#' placeholders) fall back home. The click is still logged.
  let destination: URL;
  try {
    destination = new URL(link.url);
  } catch {
    destination = home;
  }
  return NextResponse.redirect(destination, 302);
}
