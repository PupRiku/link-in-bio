"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EventRow } from "@/lib/supabase/types";

export type ActionState = { error?: string };

function str(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}

function revalidateAll() {
  revalidatePath("/"); // public travel panel
  revalidatePath("/admin/events");
  revalidatePath("/admin");
}

function parseEventForm(formData: FormData): {
  values?: Partial<EventRow>;
  error?: string;
} {
  const title = str(formData, "title");
  const starts_at = str(formData, "starts_at");
  const ends_at = str(formData, "ends_at");

  if (!title) return { error: "Title is required." };
  if (!starts_at) return { error: "Start date is required." };
  if (ends_at && ends_at < starts_at)
    return { error: "End date can't be before the start date." };

  return {
    values: {
      title,
      venue: str(formData, "venue") || null,
      city: str(formData, "city") || null,
      starts_at,
      ends_at: ends_at || null,
      url: str(formData, "url") || null,
      blurb: str(formData, "blurb") || null,
      is_public: formData.get("is_public") != null,
    },
  };
}

export async function createEvent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const { values, error } = parseEventForm(formData);
  if (error) return { error };

  const { error: insertErr } = await supabaseAdmin.from("event").insert(values!);
  if (insertErr) return { error: insertErr.message };

  revalidateAll();
  redirect("/admin/events");
}

export async function updateEvent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return { error: "Missing event id." };

  const { values, error } = parseEventForm(formData);
  if (error) return { error };

  const { error: updateErr } = await supabaseAdmin
    .from("event")
    .update(values!)
    .eq("id", id);
  if (updateErr) return { error: updateErr.message };

  revalidateAll();
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) {
    await supabaseAdmin.from("event").delete().eq("id", id);
    revalidateAll();
  }
  redirect("/admin/events");
}
