/**
 * Hand-written row types mirroring supabase/migrations/0001_init.sql.
 * (Kept minimal — can later be replaced by `supabase gen types`.)
 *
 * NOTE: these are declared with `type`, not `interface`, on purpose.
 * supabase-js's `GenericSchema` constraint requires each table's
 * Row/Insert/Update to be assignable to `Record<string, unknown>`, and
 * interfaces (unlike object-literal type aliases) don't get an implicit
 * index signature — so using `interface` here collapses the typed client
 * to `never`.
 */

export type LinkTier = "public" | "after_dark";
export type LinkAccent = "steel" | "orange" | "purple" | "teal" | "oxblood";

export type Profile = {
  id: string;
  display_name: string;
  tagline: string | null;
  current_city: string | null;
  hero_image_url: string | null;
  spotify_playlist_url: string | null;
  updated_at: string;
};

export type Link = {
  id: string;
  label: string;
  slug: string;
  url: string;
  tier: LinkTier;
  accent: LinkAccent;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

export type EventRow = {
  id: string;
  title: string;
  venue: string | null;
  city: string | null;
  starts_at: string;
  ends_at: string | null;
  url: string | null;
  blurb: string | null;
  is_public: boolean;
};

export type ClickEvent = {
  id: number;
  slug: string | null;
  link_id: string | null;
  created_at: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
};

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      link: {
        Row: Link;
        Insert: Partial<Link>;
        Update: Partial<Link>;
        Relationships: [];
      };
      event: {
        Row: EventRow;
        Insert: Partial<EventRow>;
        Update: Partial<EventRow>;
        Relationships: [];
      };
      click_event: {
        Row: ClickEvent;
        Insert: Partial<Omit<ClickEvent, "id" | "created_at">>;
        Update: Partial<ClickEvent>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
