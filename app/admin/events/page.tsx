import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EventRow } from "@/lib/supabase/types";
import { createEvent, deleteEvent } from "./actions";
import EventForm from "./EventForm";

export const dynamic = "force-dynamic";

function fmt(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}-${m}-${d}`;
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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Events</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Upcoming travel shown on the public page (public events with a future
          start date).
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
        {events.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No events yet.</div>
        ) : (
          events.map((ev) => {
            const past = ev.starts_at < today;
            return (
              <div
                key={ev.id}
                className="flex flex-wrap items-center gap-3 border-b border-zinc-800 px-4 py-3 last:border-b-0"
              >
                <span className="w-24 font-mono text-xs text-zinc-400">
                  {fmt(ev.starts_at)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ev.title}</span>
                    {!ev.is_public ? (
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                        private
                      </span>
                    ) : null}
                    {past ? (
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-500">
                        past
                      </span>
                    ) : null}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {[ev.venue, ev.city].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <Link
                  href={`/admin/events/${ev.id}`}
                  className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500"
                >
                  Edit
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={ev.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-900/60 px-2 py-1 text-xs text-red-300 hover:border-red-700"
                  >
                    Delete
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Add an event</h2>
        <div className="max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <EventForm action={createEvent} submitLabel="Create event" />
        </div>
      </div>
    </div>
  );
}
