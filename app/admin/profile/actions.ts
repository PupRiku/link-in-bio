"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ActionState = { error?: string; ok?: boolean };

function str(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}

export async function updateProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const display_name = str(formData, "display_name");
  if (!display_name) return { error: "Display name is required." };

  const values = {
    display_name,
    tagline: str(formData, "tagline") || null,
    current_city: str(formData, "current_city") || null,
    hero_image_url: str(formData, "hero_image_url") || null,
    spotify_playlist_url: str(formData, "spotify_playlist_url") || null,
    updated_at: new Date().toISOString(),
  };

  const id = str(formData, "id");
  const { error } = id
    ? await supabaseAdmin.from("profile").update(values).eq("id", id)
    : await supabaseAdmin.from("profile").insert(values);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { ok: true };
}
