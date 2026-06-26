import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/supabase/types";
import { Card, PageHeader } from "../_components/ui";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await requireAdmin();

  const { data } = await supabaseAdmin
    .from("profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  const profile = (data ?? null) as Profile | null;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Profile"
        subtitle="Drives the hero, tagline, and status line on the public page."
      />
      <Card>
        <ProfileForm profile={profile} />
      </Card>
    </div>
  );
}
