import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow, LinkTier } from "@/lib/supabase/types";
import { Bar, Card, PageHeader, StatCard } from "../_components/ui";
import TrendChart from "../_components/TrendChart";

export const dynamic = "force-dynamic";

type ClickRow = {
  slug: string | null;
  link_id: string | null;
  referrer: string | null;
  created_at: string;
};

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
  const resolve = (c: ClickRow) =>
    (c.link_id && linkById.get(c.link_id)) ||
    (c.slug && linkBySlug.get(c.slug)) ||
    null;

  const perLink = new Map<
    string,
    { label: string; tier: LinkTier | "unknown"; count: number }
  >();
  const tierSplit: Record<"public" | "after_dark" | "unknown", number> = {
    public: 0,
    after_dark: 0,
    unknown: 0,
  };
  const referrers = new Map<string, number>();

  // 30-day buckets (UTC).
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  let last30 = 0;

  for (const c of clicks) {
    const link = resolve(c);
    const tier: LinkTier | "unknown" = link ? link.tier : "unknown";

    const key = link?.id ?? c.slug ?? "unknown";
    const label = link ? link.label : `${c.slug ?? "unknown"} (deleted)`;
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

    const idx = dayIndex.get(c.created_at.slice(0, 10));
    if (idx != null) {
      days[idx].count += 1;
      last30 += 1;
    }
  }

  const perLinkSorted = [...perLink.values()].sort((a, b) => b.count - a.count);
  const maxPerLink = perLinkSorted[0]?.count ?? 0;

  const topReferrers = [...referrers.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxReferrer = topReferrers[0]?.count ?? 0;

  const publicTotal = tierSplit.public;
  const afterDarkTotal = tierSplit.after_dark;
  const splitDenom = publicTotal + afterDarkTotal + tierSplit.unknown || 1;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Click attribution from the /go redirect. After-dark figures are admin-only."
      />

      <div className="mb-[22px] grid grid-cols-2 gap-[14px] min-[861px]:grid-cols-4">
        <StatCard label="Total clicks" value={total} accent="teal" />
        <StatCard label="Last 30 days" value={last30} accent="steel" />
        <StatCard label="Public clicks" value={publicTotal} accent="teal" />
        <StatCard
          label="After-dark clicks"
          value={afterDarkTotal}
          accent="oxblood"
        />
      </div>

      <div className="mb-[22px]">
        <Card title="Clicks" aside="last 30 days">
          {last30 === 0 ? (
            <p className="text-sm text-dim">No clicks in the last 30 days.</p>
          ) : (
            <TrendChart data={days.map((d) => d.count)} />
          )}
        </Card>
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-[14px] min-[861px]:grid-cols-2">
        <Card title="Clicks per link">
          {perLinkSorted.length === 0 ? (
            <p className="text-sm text-dim">No clicks yet.</p>
          ) : (
            <div className="flex flex-col gap-[13px]">
              {perLinkSorted.map((l) => (
                <Bar
                  key={l.label}
                  label={l.label}
                  value={l.count}
                  max={maxPerLink}
                  zone={l.tier === "after_dark" ? "after_dark" : "public"}
                />
              ))}
            </div>
          )}
        </Card>

        <Card title="Top referrers">
          {topReferrers.length === 0 ? (
            <p className="text-sm text-dim">No clicks yet.</p>
          ) : (
            <div className="flex flex-col gap-[13px]">
              {topReferrers.map((r) => (
                <Bar key={r.name} label={r.name} value={r.count} max={maxReferrer} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Public vs after-dark">
        <div className="mb-3 flex h-3 w-full overflow-hidden rounded bg-surface-2">
          <div
            className="h-3 bg-teal"
            style={{ width: `${(publicTotal / splitDenom) * 100}%` }}
          />
          <div
            className="h-3 bg-oxblood-live"
            style={{ width: `${(afterDarkTotal / splitDenom) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-steel">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-teal" />
            Public · {publicTotal}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-oxblood-live" />
            After-dark · {afterDarkTotal}
          </span>
          {tierSplit.unknown > 0 ? (
            <span className="text-dim">Unknown · {tierSplit.unknown}</span>
          ) : null}
        </div>
      </Card>
    </>
  );
}
