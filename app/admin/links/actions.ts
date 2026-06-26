"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow, LinkAccent, LinkTier } from "@/lib/supabase/types";

export type ActionState = { error?: string };

const TIERS: LinkTier[] = ["public", "after_dark"];
const ACCENTS: LinkAccent[] = ["steel", "orange", "purple", "teal", "oxblood"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function str(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}

function revalidateAll() {
  revalidatePath("/"); // public page picks up changes
  revalidatePath("/admin/links");
  revalidatePath("/admin");
}

/** Validate the shared link fields. Returns the row payload or an error. */
async function parseLinkForm(
  formData: FormData,
  currentId: string | null
): Promise<{ values?: Partial<LinkRow>; error?: string }> {
  const label = str(formData, "label");
  const slug = str(formData, "slug").toLowerCase();
  const url = str(formData, "url");
  const tier = str(formData, "tier") as LinkTier;
  const accent = (str(formData, "accent") || "steel") as LinkAccent;
  const icon = str(formData, "icon");
  const sortRaw = str(formData, "sort_order");
  const is_active = formData.get("is_active") != null;

  if (!label) return { error: "Label is required." };
  if (!slug) return { error: "Slug is required." };
  if (!SLUG_RE.test(slug))
    return {
      error: "Slug must be lowercase letters, numbers, and hyphens only.",
    };
  if (!url) return { error: "URL is required." };
  if (!TIERS.includes(tier)) return { error: "Pick a valid tier." };
  if (!ACCENTS.includes(accent)) return { error: "Pick a valid accent." };

  const sort_order = sortRaw ? Number(sortRaw) : 0;
  if (!Number.isFinite(sort_order))
    return { error: "Sort order must be a number." };

  // Slug uniqueness (exclude self on edit).
  let dupeQuery = supabaseAdmin.from("link").select("id").eq("slug", slug);
  if (currentId) dupeQuery = dupeQuery.neq("id", currentId);
  const { data: dupes, error: dupeErr } = await dupeQuery.limit(1);
  if (dupeErr) return { error: dupeErr.message };
  if (dupes && dupes.length > 0)
    return { error: `Slug "${slug}" is already in use.` };

  return {
    values: {
      label,
      slug,
      url,
      tier,
      accent,
      icon: icon || null,
      sort_order,
      is_active,
    },
  };
}

export async function createLink(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const { values, error } = await parseLinkForm(formData, null);
  if (error) return { error };

  const { error: insertErr } = await supabaseAdmin.from("link").insert(values!);
  if (insertErr) return { error: insertErr.message };

  revalidateAll();
  redirect("/admin/links");
}

export async function updateLink(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return { error: "Missing link id." };

  const { values, error } = await parseLinkForm(formData, id);
  if (error) return { error };

  const { error: updateErr } = await supabaseAdmin
    .from("link")
    .update(values!)
    .eq("id", id);
  if (updateErr) return { error: updateErr.message };

  revalidateAll();
  redirect("/admin/links");
}

export async function deleteLink(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) {
    await supabaseAdmin.from("link").delete().eq("id", id);
    revalidateAll();
  }
  redirect("/admin/links");
}

export async function toggleLinkActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const next = formData.get("next") === "true";
  if (id) {
    await supabaseAdmin.from("link").update({ is_active: next }).eq("id", id);
    revalidateAll();
  }
  redirect("/admin/links");
}

/**
 * Move a link up or down within its tier by swapping sort_order with the
 * adjacent link in that tier.
 */
export async function moveLink(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const direction = str(formData, "direction"); // "up" | "down"
  if (!id || (direction !== "up" && direction !== "down")) {
    redirect("/admin/links");
  }

  const { data: current } = await supabaseAdmin
    .from("link")
    .select("id, tier, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (!current) redirect("/admin/links");

  // Find the neighbour in the same tier in the chosen direction.
  const neighbourQuery = supabaseAdmin
    .from("link")
    .select("id, sort_order")
    .eq("tier", current!.tier);

  const { data: neighbour } =
    direction === "up"
      ? await neighbourQuery
          .lt("sort_order", current!.sort_order)
          .order("sort_order", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await neighbourQuery
          .gt("sort_order", current!.sort_order)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();

  if (neighbour) {
    // Swap the two sort_order values.
    await supabaseAdmin
      .from("link")
      .update({ sort_order: neighbour.sort_order })
      .eq("id", current!.id);
    await supabaseAdmin
      .from("link")
      .update({ sort_order: current!.sort_order })
      .eq("id", neighbour.id);
    revalidateAll();
  }
  redirect("/admin/links");
}
