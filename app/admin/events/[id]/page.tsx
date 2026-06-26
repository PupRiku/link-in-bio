import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EventRow } from "@/lib/supabase/types";
import EventForm from "../EventForm";
import { updateEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("event")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const event = data as EventRow;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Events
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Edit “{event.title}”</h1>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <EventForm
          action={updateEvent}
          defaultValues={event}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
