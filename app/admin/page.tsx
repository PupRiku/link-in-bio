import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow, LinkTier } from "@/lib/supabase/types";
import {
  Bar,
  Card,
  FeedRow,
  PageHeader,
  StatCard,
  ViewSiteLink,
} from "./_components/ui";
import TrendChart from "./_components/TrendChart";

export const dynamic = "force-dynamic";

type ClickRow = {
  slug: string | null;
  link_id: string | null;
  referrer: string | null;
  created_at: string;
};

const ZONE_DOT: Record<LinkTier | "unknown", string> = {
  public: "var(--color-teal)",
  after_dark: "var(--color-oxblood-live)",
  unknown: "var(--color-dim)",
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default async function AdminHome() {
  await requireAdmin();

  const since30 = new Date();
  since30.setUTCDate(since30.getUTCDate() - 29);
  const since30Iso = since30.toISOString().slice(0, 10);

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

  const activeLinks = links.filter((l) => l.is_active);
  const activePublic = activeLinks.filter((l) => l.tier === "public").length;
  const activeDark = activeLinks.filter((l) => l.tier === "after_dark").length;

  // 30-day trend buckets (UTC).
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  let last30 = 0;
  let last30Dark = 0;
  const perLink = new Map<
    string,
    { label: string; tier: LinkTier | "unknown"; count: number }
  >();

  for (const c of clicks) {
    const link = resolve(c);
    const tier: LinkTier | "unknown" = link ? link.tier : "unknown";
    const day = c.created_at.slice(0, 10);
    const idx = dayIndex.get(day);
    if (idx != null) {
      days[idx].count += 1;
      last30 += 1;
      if (tier === "after_dark") last30Dark += 1;
    }
    const key = link?.id ?? c.slug ?? "unknown";
    const label = link ? link.label : `${c.slug ?? "unknown"} (deleted)`;
    const entry = perLink.get(key) ?? { label, tier, count: 0 };
    entry.count += 1;
    perLink.set(key, entry);
  }

  const topLinks = [...perLink.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxTop = topLinks[0]?.count ?? 0;
  const darkShare =
    last30 > 0 ? Math.round((last30Dark / last30) * 100) : 0;

  const recent = clicks.slice(0, 6).map((c) => {
    const link = resolve(c);
    let ref = "direct";
    if (c.referrer) {
      try {
        ref = new URL(c.referrer).hostname;
      } catch {
        ref = c.referrer;
      }
    }
    return {
      label: link ? link.label : c.slug ?? "unknown",
      tier: (link ? link.tier : "unknown") as LinkTier | "unknown",
      accent: link?.accent ?? "steel",
      ref,
      ago: timeAgo(c.created_at),
    };
  });

  const referrers = new Map<string, number>();
  for (const c of clicks) {
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
  const topReferrers = [...referrers.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of clicks and link activity"
        action={<ViewSiteLink />}
      />

      <div className="mb-[22px] grid grid-cols-2 gap-[14px] min-[861px]:grid-cols-4">
        <StatCard label="Total clicks" value={total} accent="teal" />
        <StatCard
          label="Last 30 days"
          value={last30}
          detail="across all links"
          accent="steel"
        />
        <StatCard
          label="Active links"
          value={activeLinks.length}
          detail={`${activePublic} public · ${activeDark} after dark`}
          accent="purple"
        />
        <StatCard
          label="After-dark share"
          value={`${darkShare}%`}
          detail="of last-30-day taps"
          accent="oxblood"
        />
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-[14px] min-[861px]:grid-cols-[1.55fr_1fr]">
        <Card title="Clicks" aside="last 30 days">
          <TrendChart data={days.map((d) => d.count)} />
        </Card>
        <Card title="Top links">
          {topLinks.length === 0 ? (
            <p className="text-sm text-dim">No clicks yet.</p>
          ) : (
            <div className="flex flex-col gap-[13px]">
              {topLinks.map((l) => (
                <Bar
                  key={l.label}
                  label={l.label}
                  value={l.count}
                  max={maxTop}
                  zone={l.tier === "after_dark" ? "after_dark" : "public"}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-[14px] min-[861px]:grid-cols-2">
        <Card title="Recent clicks">
          {recent.length === 0 ? (
            <p className="text-sm text-dim">No clicks yet.</p>
          ) : (
            <div className="flex flex-col">
              {recent.map((r, i) => (
                <FeedRow
                  key={i}
                  dotColor={ZONE_DOT[r.tier]}
                  label={r.label}
                  sub={r.ref}
                  trailing={r.ago}
                />
              ))}
            </div>
          )}
        </Card>
        <Card title="Top referrers">
          {topReferrers.length === 0 ? (
            <p className="text-sm text-dim">No clicks yet.</p>
          ) : (
            <div className="flex flex-col">
              {topReferrers.map((r) => (
                <FeedRow key={r.name} label={r.name} trailing={r.count} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
