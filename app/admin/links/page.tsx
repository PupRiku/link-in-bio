import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow } from "@/lib/supabase/types";
import { deleteLink, moveLink, toggleLinkActive } from "./actions";
import LinkForm from "./LinkForm";
import { createLink } from "./actions";

export const dynamic = "force-dynamic";

function LinkRowItem({ link }: { link: LinkRow }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 px-4 py-3 last:border-b-0">
      <div className="flex flex-col items-center gap-0.5">
        <form action={moveLink}>
          <input type="hidden" name="id" value={link.id} />
          <input type="hidden" name="direction" value="up" />
          <button
            type="submit"
            aria-label="Move up"
            className="px-1 text-zinc-500 hover:text-zinc-200"
          >
            ▲
          </button>
        </form>
        <form action={moveLink}>
          <input type="hidden" name="id" value={link.id} />
          <input type="hidden" name="direction" value="down" />
          <button
            type="submit"
            aria-label="Move down"
            className="px-1 text-zinc-500 hover:text-zinc-200"
          >
            ▼
          </button>
        </form>
      </div>

      <span className="flex h-8 w-10 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-300">
        {link.icon ?? link.label.slice(0, 2)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{link.label}</span>
          {!link.is_active ? (
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
              hidden
            </span>
          ) : null}
        </div>
        <div className="truncate text-xs text-zinc-500">
          /go/{link.slug} → {link.url}
        </div>
      </div>

      <span className="rounded bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400">
        {link.tier} · {link.accent}
      </span>

      <form action={toggleLinkActive}>
        <input type="hidden" name="id" value={link.id} />
        <input type="hidden" name="next" value={(!link.is_active).toString()} />
        <button
          type="submit"
          className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500"
        >
          {link.is_active ? "Hide" : "Show"}
        </button>
      </form>

      <Link
        href={`/admin/links/${link.id}`}
        className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500"
      >
        Edit
      </Link>

      <form action={deleteLink}>
        <input type="hidden" name="id" value={link.id} />
        <button
          type="submit"
          className="rounded-md border border-red-900/60 px-2 py-1 text-xs text-red-300 hover:border-red-700"
        >
          Delete
        </button>
      </form>
    </div>
  );
}

function TierSection({ title, links }: { title: string; links: LinkRow[] }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
        {links.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No links yet.</div>
        ) : (
          links.map((link) => <LinkRowItem key={link.id} link={link} />)
        )}
      </div>
    </div>
  );
}

export default async function LinksPage() {
  await requireAdmin();

  const { data } = await supabaseAdmin
    .from("link")
    .select("*")
    .order("tier", { ascending: true })
    .order("sort_order", { ascending: true });

  const links = (data ?? []) as LinkRow[];
  const publicLinks = links.filter((l) => l.tier === "public");
  const afterDark = links.filter((l) => l.tier === "after_dark");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Links</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Set real destinations and order. Changes publish to the site
          immediately.
        </p>
      </div>

      <div className="space-y-6">
        <TierSection title="Public" links={publicLinks} />
        <TierSection title="After dark" links={afterDark} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Add a link</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <LinkForm action={createLink} submitLabel="Create link" />
        </div>
      </div>
    </div>
  );
}
