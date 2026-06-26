import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow } from "@/lib/supabase/types";
import {
  Badge,
  Card,
  IconButton,
  PageHeader,
} from "../_components/ui";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  TrashIcon,
} from "../_components/icons";
import {
  createLink,
  deleteLink,
  moveLink,
  toggleLinkActive,
} from "./actions";
import LinkForm from "./LinkForm";

export const dynamic = "force-dynamic";

const ROW_GRID =
  "min-[861px]:grid min-[861px]:grid-cols-[40px_minmax(0,1.6fr)_minmax(0,1fr)_104px_52px_auto] min-[861px]:items-center min-[861px]:gap-3";

function ActiveToggle({ link }: { link: LinkRow }) {
  const on = link.is_active;
  return (
    <form action={toggleLinkActive}>
      <input type="hidden" name="id" value={link.id} />
      <input type="hidden" name="next" value={(!on).toString()} />
      <button
        type="submit"
        role="switch"
        aria-checked={on}
        aria-label={on ? "Hide link" : "Show link"}
        className={`relative h-[21px] w-[38px] rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 ${
          on ? "border-teal bg-teal/20" : "border-line-2 bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[15px] w-[15px] rounded-full transition-all ${
            on
              ? "left-[19px] bg-teal shadow-[0_0_8px_var(--color-teal)]"
              : "left-[2px] bg-dim"
          }`}
        />
      </button>
    </form>
  );
}

function LinkRowItem({ link }: { link: LinkRow }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3.5 last:border-b-0 hover:bg-surface-2 min-[861px]:px-[18px] min-[861px]:py-[13px] ${ROW_GRID}`}
    >
      {/* chip */}
      <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] border border-line-2 bg-surface-2 font-oswald text-[12px] font-semibold text-steel">
        {link.icon ?? link.label.slice(0, 2)}
      </span>

      {/* label + slug */}
      <div className="min-w-0 flex-1">
        <b className="text-[14px] font-medium">{link.label}</b>
        <span className="block text-[11.5px] text-dim">/go/{link.slug}</span>
      </div>

      {/* destination */}
      <div className="order-last w-full truncate text-[12.5px] tabular-nums text-mute min-[861px]:order-none min-[861px]:w-auto">
        {link.url}
      </div>

      {/* tier */}
      <div>
        <Badge tier={link.tier} />
      </div>

      {/* active toggle */}
      <ActiveToggle link={link} />

      {/* actions */}
      <div className="ml-auto flex items-center gap-1.5 min-[861px]:ml-0 min-[861px]:justify-end">
        <form action={moveLink}>
          <input type="hidden" name="id" value={link.id} />
          <input type="hidden" name="direction" value="up" />
          <IconButton type="submit" aria-label="Move up">
            <ChevronUpIcon />
          </IconButton>
        </form>
        <form action={moveLink}>
          <input type="hidden" name="id" value={link.id} />
          <input type="hidden" name="direction" value="down" />
          <IconButton type="submit" aria-label="Move down">
            <ChevronDownIcon />
          </IconButton>
        </form>
        <IconButton href={`/admin/links/${link.id}`} aria-label="Edit link">
          <EditIcon />
        </IconButton>
        <form action={deleteLink}>
          <input type="hidden" name="id" value={link.id} />
          <IconButton variant="del" type="submit" aria-label="Delete link">
            <TrashIcon />
          </IconButton>
        </form>
      </div>
    </div>
  );
}

function TierTable({ title, links }: { title: string; links: LinkRow[] }) {
  return (
    <div>
      <h2 className="mb-2.5 font-oswald text-[12px] font-semibold uppercase tracking-[0.16em] text-steel">
        {title}
      </h2>
      <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
        <div
          className={`hidden border-b border-line bg-panel px-[18px] py-2.5 font-oswald text-[10.5px] uppercase tracking-[0.16em] text-mute min-[861px]:grid min-[861px]:grid-cols-[40px_minmax(0,1.6fr)_minmax(0,1fr)_104px_52px_auto] min-[861px]:items-center min-[861px]:gap-3`}
        >
          <div />
          <div>Link</div>
          <div>Destination</div>
          <div>Tier</div>
          <div>Active</div>
          <div className="text-right">Actions</div>
        </div>
        {links.length === 0 ? (
          <div className="px-[18px] py-6 text-sm text-dim">No links yet.</div>
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
    <>
      <PageHeader
        title="Links"
        subtitle="Set real destinations and order. Changes publish to the site immediately."
      />

      <div className="space-y-6">
        <TierTable title="Public" links={publicLinks} />
        <TierTable title="After dark" links={afterDark} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-oswald text-[12px] font-semibold uppercase tracking-[0.16em] text-steel">
          Add a link
        </h2>
        <Card>
          <LinkForm action={createLink} submitLabel="Create link" />
        </Card>
      </div>
    </>
  );
}
