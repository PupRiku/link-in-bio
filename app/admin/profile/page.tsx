import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/supabase/types";
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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Drives the hero, tagline, and status line on the public page.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
