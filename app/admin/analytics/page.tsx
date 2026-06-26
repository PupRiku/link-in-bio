import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow, LinkTier } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type ClickRow = {
  slug: string | null;
  link_id: string | null;
  referrer: string | null;
  created_at: string;
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  sub,
}: {
  label: string;
  value: number;
  max: number;
  sub?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-zinc-300">
          {label}
          {sub ? <span className="ml-2 text-xs text-zinc-600">{sub}</span> : null}
        </span>
        <span className="tabular-nums text-zinc-400">{value}</span>
      </div>
      <div className="h-2 w-full rounded bg-zinc-800">
        <div
          className="h-2 rounded bg-zinc-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  await requireAdmin();

  const [{ data: linkData }, { data: clickData }, { count: totalCount }] =
    await Promise.all([
      supabaseAdmin.from("link").select("*"),
      supabaseAdmin
        .from("click_event")
        .select("slug, link_id, referrer, created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
      supabaseAdmin
        .from("click_event")
        .select("*", { count: "exact", head: true }),
    ]);

  const links = (linkData ?? []) as LinkRow[];
  const clicks = (clickData ?? []) as ClickRow[];
  const total = totalCount ?? clicks.length;

  const linkById = new Map(links.map((l) => [l.id, l]));
  const linkBySlug = new Map(links.map((l) => [l.slug, l]));

  // Clicks per link (joined to label + tier).
  const perLink = new Map<
    string,
    { label: string; tier: LinkTier | "unknown"; count: number }
  >();
  // Public vs after-dark split.
  const tierSplit: Record<"public" | "after_dark" | "unknown", number> = {
    public: 0,
    after_dark: 0,
    unknown: 0,
  };
  // Referrers.
  const referrers = new Map<string, number>();

  for (const c of clicks) {
    const link =
      (c.link_id && linkById.get(c.link_id)) ||
      (c.slug && linkBySlug.get(c.slug)) ||
      null;
    const key = link?.id ?? c.slug ?? "unknown";
    const label = link ? link.label : `${c.slug ?? "unknown"} (deleted)`;
    const tier: LinkTier | "unknown" = link ? link.tier : "unknown";

    const entry = perLink.get(key) ?? { label, tier, count: 0 };
    entry.count += 1;
    perLink.set(key, entry);

    tierSplit[tier] += 1;

    let ref = "Direct / none";
    if (c.referrer) {
      try {
        ref = new URL(c.referrer).hostname;
      } catch {
        ref = c.referrer;
      }
    }
    referrers.set(ref, (referrers.get(ref) ?? 0) + 1);
  }

  const perLinkSorted = [...perLink.values()].sort((a, b) => b.count - a.count);
  const maxPerLink = perLinkSorted[0]?.count ?? 0;

  const topReferrers = [...referrers.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxReferrer = topReferrers[0]?.count ?? 0;

  // Last 30 days trend (UTC day buckets).
  const days: { date: string; label: string; count: number }[] = [];
  const todayUTC = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayUTC);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, label: iso.slice(5), count: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  for (const c of clicks) {
    const iso = c.created_at.slice(0, 10);
    const idx = dayIndex.get(iso);
    if (idx != null) days[idx].count += 1;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const last30Total = days.reduce((s, d) => s + d.count, 0);

  const publicTotal = tierSplit.public;
  const afterDarkTotal = tierSplit.after_dark;
  const splitDenom = publicTotal + afterDarkTotal + tierSplit.unknown || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Click attribution from the /go redirect. After-dark figures are
          admin-only and never shown publicly.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-2xl font-semibold tabular-nums">{total}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            Total clicks
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-2xl font-semibold tabular-nums">
            {last30Total}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            Clicks · 30d
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-2xl font-semibold tabular-nums">
            {publicTotal}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            Public clicks
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="text-2xl font-semibold tabular-nums">
            {afterDarkTotal}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            After-dark clicks
          </div>
        </div>
      </div>

      <Card title="Last 30 days">
        {last30Total === 0 ? (
          <p className="text-sm text-zinc-500">No clicks in the last 30 days.</p>
        ) : (
          <div className="flex h-32 items-end gap-1">
            {days.map((d) => (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center justify-end"
                title={`${d.date}: ${d.count}`}
              >
                <div
                  className="w-full rounded-t bg-zinc-500"
                  style={{
                    height: `${Math.round((d.count / maxDay) * 100)}%`,
                    minHeight: d.count > 0 ? "3px" : "0",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Clicks per link">
          {perLinkSorted.length === 0 ? (
            <p className="text-sm text-zinc-500">No clicks yet.</p>
          ) : (
            perLinkSorted.map((l) => (
              <Bar
                key={l.label}
                label={l.label}
                sub={l.tier}
                value={l.count}
                max={maxPerLink}
              />
            ))
          )}
        </Card>

        <Card title="Top referrers">
          {topReferrers.length === 0 ? (
            <p className="text-sm text-zinc-500">No clicks yet.</p>
          ) : (
            topReferrers.map((r) => (
              <Bar
                key={r.name}
                label={r.name}
                value={r.count}
                max={maxReferrer}
              />
            ))
          )}
        </Card>
      </div>

      <Card title="Public vs after-dark">
        <div className="mb-3 flex h-3 w-full overflow-hidden rounded bg-zinc-800">
          <div
            className="h-3 bg-teal-400"
            style={{ width: `${(publicTotal / splitDenom) * 100}%` }}
          />
          <div
            className="h-3 bg-red-500"
            style={{ width: `${(afterDarkTotal / splitDenom) * 100}%` }}
          />
        </div>
        <div className="flex gap-6 text-sm">
          <span className="text-zinc-300">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-teal-400" />
            Public · {publicTotal}
          </span>
          <span className="text-zinc-300">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
            After-dark · {afterDarkTotal}
          </span>
          {tierSplit.unknown > 0 ? (
            <span className="text-zinc-500">Unknown · {tierSplit.unknown}</span>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
