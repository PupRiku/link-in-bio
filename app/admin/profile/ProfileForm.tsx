"use client";

import { useActionState } from "react";

import type { Profile } from "@/lib/supabase/types";
import { updateProfile, type ActionState } from "./actions";

const field =
  "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400";
const labelCls = "block text-xs font-medium uppercase tracking-wide text-zinc-400";

export default function ProfileForm({
  profile,
}: {
  profile: Profile | null;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateProfile,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {profile?.id ? (
        <input type="hidden" name="id" value={profile.id} />
      ) : null}

      {state?.error ? (
        <div className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}
      {state?.ok ? (
        <div className="rounded-md border border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
          Saved.
        </div>
      ) : null}

      <div className="space-y-1">
        <label className={labelCls} htmlFor="display_name">
          Display name (wordmark)
        </label>
        <input
          id="display_name"
          name="display_name"
          className={field}
          defaultValue={profile?.display_name ?? "RIKU"}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          className={field}
          defaultValue={profile?.tagline ?? ""}
          placeholder="madison / chicago"
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls} htmlFor="current_city">
          Current city (status line)
        </label>
        <input
          id="current_city"
          name="current_city"
          className={field}
          defaultValue={profile?.current_city ?? ""}
          placeholder="Madison"
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls} htmlFor="hero_image_url">
          Hero image URL
        </label>
        <input
          id="hero_image_url"
          name="hero_image_url"
          className={field}
          defaultValue={profile?.hero_image_url ?? ""}
          placeholder="/riku-hero.jpg"
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls} htmlFor="spotify_playlist_url">
          Spotify playlist URL
        </label>
        <input
          id="spotify_playlist_url"
          name="spotify_playlist_url"
          className={field}
          defaultValue={profile?.spotify_playlist_url ?? ""}
          placeholder="https://open.spotify.com/playlist/…"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
      >
        Save profile
      </button>
    </form>
  );
}
