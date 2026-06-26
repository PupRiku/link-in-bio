import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </div>
    </div>
  );
}

export default async function AdminHome() {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sevenDaysAgo = since.toISOString();

  const [links, activeLinks, events, totalClicks, recentClicks] =
    await Promise.all([
      supabaseAdmin.from("link").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("link")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabaseAdmin.from("event").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("click_event")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("click_event")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
    ]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Manage the public page and review traffic.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Active links"
          value={`${activeLinks.count ?? 0} / ${links.count ?? 0}`}
        />
        <Stat label="Events" value={events.count ?? 0} />
        <Stat label="Total clicks" value={totalClicks.count ?? 0} />
        <Stat label="Clicks · 7d" value={recentClicks.count ?? 0} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/links"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-600"
        >
          <div className="font-medium">Links →</div>
          <div className="mt-1 text-sm text-zinc-400">
            Set real destinations, tiers, accents, order, and visibility.
          </div>
        </Link>
        <Link
          href="/admin/events"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-600"
        >
          <div className="font-medium">Events →</div>
          <div className="mt-1 text-sm text-zinc-400">
            Manage the upcoming-travel panel.
          </div>
        </Link>
        <Link
          href="/admin/profile"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-600"
        >
          <div className="font-medium">Profile →</div>
          <div className="mt-1 text-sm text-zinc-400">
            Wordmark, tagline, current city, hero, Spotify.
          </div>
        </Link>
        <Link
          href="/admin/analytics"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-600"
        >
          <div className="font-medium">Analytics →</div>
          <div className="mt-1 text-sm text-zinc-400">
            Clicks per link, trend, referrers, public vs after-dark.
          </div>
        </Link>
      </div>
    </div>
  );
}
