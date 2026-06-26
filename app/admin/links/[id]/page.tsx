import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow } from "@/lib/supabase/types";
import LinkForm from "../LinkForm";
import { updateLink } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("link")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const link = data as LinkRow;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/links"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Links
        </Link>
        <h1 className="mt-2 text-xl font-semibold">Edit “{link.label}”</h1>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <LinkForm
          action={updateLink}
          defaultValues={link}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
