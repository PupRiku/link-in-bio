import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EventRow } from "@/lib/supabase/types";
import { Card, PageHeader } from "../../_components/ui";
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
    <div className="max-w-2xl">
      <Link
        href="/admin/events"
        className="font-oswald text-[12px] uppercase tracking-[0.1em] text-mute hover:text-steel"
      >
        ← Events
      </Link>
      <div className="mt-3">
        <PageHeader title="Edit event" subtitle={event.title} />
      </div>
      <Card>
        <EventForm action={updateEvent} defaultValues={event} submitLabel="Save changes" />
      </Card>
    </div>
  );
}
