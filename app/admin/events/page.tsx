import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EventRow } from "@/lib/supabase/types";
import { Card, IconButton, PageHeader } from "../_components/ui";
import { EditIcon, TrashIcon } from "../_components/icons";
import { createEvent, deleteEvent } from "./actions";
import EventForm from "./EventForm";

export const dynamic = "force-dynamic";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(date: string): { d: string; m: string } {
  const [, month, day] = date.split("-");
  const idx = Math.max(0, Math.min(11, Number(month) - 1));
  return { d: (day ?? "").padStart(2, "0"), m: MONTHS[idx] };
}

export default async function EventsPage() {
  await requireAdmin();

  const { data } = await supabaseAdmin
    .from("event")
    .select("*")
    .order("starts_at", { ascending: true });

  const events = (data ?? []) as EventRow[];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Upcoming travel shown on the public page (public events with a future start date)."
      />

      <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
        {events.length === 0 ? (
          <div className="px-[18px] py-6 text-sm text-dim">No events yet.</div>
        ) : (
          events.map((ev) => {
            const { d, m } = fmtDate(ev.starts_at);
            const past = ev.starts_at < today;
            return (
              <div
                key={ev.id}
                className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-line px-[18px] py-3.5 last:border-b-0 hover:bg-surface-2"
              >
                <div className="flex w-[52px] flex-none flex-col items-center text-center font-oswald leading-[1.05]">
                  <span className="text-[20px] font-semibold text-teal">{d}</span>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-mute">
                    {m}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-[14.5px] font-medium">{ev.title}</b>
                    {!ev.is_public ? (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-mute">
                        private
                      </span>
                    ) : null}
                    {past ? (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-dim">
                        past
                      </span>
                    ) : null}
                  </div>
                  <span className="block text-[12.5px] text-mute">
                    {[ev.venue, ev.city].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <IconButton href={`/admin/events/${ev.id}`} aria-label="Edit event">
                    <EditIcon />
                  </IconButton>
                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={ev.id} />
                    <IconButton variant="del" type="submit" aria-label="Delete event">
                      <TrashIcon />
                    </IconButton>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-oswald text-[12px] font-semibold uppercase tracking-[0.16em] text-steel">
          Add an event
        </h2>
        <Card className="max-w-2xl">
          <EventForm action={createEvent} submitLabel="Create event" />
        </Card>
      </div>
    </>
  );
}
