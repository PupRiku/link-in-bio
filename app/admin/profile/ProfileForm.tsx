"use client";

import { useActionState } from "react";

import type { Profile } from "@/lib/supabase/types";
import { Button, Field, FormBanner } from "../_components/ui";
import { updateProfile, type ActionState } from "./actions";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateProfile,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {profile?.id ? (
        <input type="hidden" name="id" value={profile.id} />
      ) : null}

      <FormBanner error={state?.error} ok={state?.ok} />

      <Field
        label="Display name (wordmark)"
        name="display_name"
        defaultValue={profile?.display_name ?? "RIKU"}
        required
      />
      <Field
        label="Tagline"
        name="tagline"
        defaultValue={profile?.tagline ?? ""}
        placeholder="madison / chicago"
      />
      <Field
        label="Current city (status line)"
        name="current_city"
        defaultValue={profile?.current_city ?? ""}
        placeholder="Madison"
      />
      <Field
        label="Hero image URL"
        name="hero_image_url"
        defaultValue={profile?.hero_image_url ?? ""}
        placeholder="/riku-hero.jpg"
      />
      <Field
        label="Spotify playlist URL"
        name="spotify_playlist_url"
        defaultValue={profile?.spotify_playlist_url ?? ""}
        placeholder="https://open.spotify.com/playlist/…"
      />

      <div className="flex justify-end pt-1">
        <Button variant="solid" type="submit">
          Save profile
        </Button>
      </div>
    </form>
  );
}
