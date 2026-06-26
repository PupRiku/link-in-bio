import RikuPage from "./RikuPage";
import {
  getAfterDarkLinks,
  getProfile,
  getPublicLinks,
  getSpotifyTitle,
  getUpcomingEvents,
} from "@/lib/data";
import type { Profile } from "@/lib/supabase/types";

// Render per-request so admin edits to the DB show up without a redeploy.
export const dynamic = "force-dynamic";

// Fallback used only if the profile row hasn't been seeded yet, so the
// page never crashes on an empty database.
const FALLBACK_PROFILE: Profile = {
  id: "fallback",
  display_name: "RIKU",
  tagline: "madison / chicago",
  current_city: "Madison",
  hero_image_url: "/riku-hero.jpg",
  spotify_playlist_url: null,
  updated_at: "",
};

export default async function Page() {
  const [profile, publicLinks, afterDarkLinks, events] = await Promise.all([
    getProfile(),
    getPublicLinks(),
    getAfterDarkLinks(),
    getUpcomingEvents(),
  ]);

  const resolvedProfile = profile ?? FALLBACK_PROFILE;
  const spotifyTitle = await getSpotifyTitle(
    resolvedProfile.spotify_playlist_url
  );

  return (
    <RikuPage
      profile={resolvedProfile}
      publicLinks={publicLinks}
      afterDarkLinks={afterDarkLinks}
      events={events}
      spotifyTitle={spotifyTitle}
    />
  );
}
