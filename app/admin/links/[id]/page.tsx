import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Link as LinkRow } from "@/lib/supabase/types";
import { Card, PageHeader } from "../../_components/ui";
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
    <div className="max-w-3xl">
      <Link
        href="/admin/links"
        className="font-oswald text-[12px] uppercase tracking-[0.1em] text-mute hover:text-steel"
      >
        ← Links
      </Link>
      <div className="mt-3">
        <PageHeader title="Edit link" subtitle={`${link.label} · /go/${link.slug}`} />
      </div>
      <Card>
        <LinkForm action={updateLink} defaultValues={link} submitLabel="Save changes" />
      </Card>
    </div>
  );
}
