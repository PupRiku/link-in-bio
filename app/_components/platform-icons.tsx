import type { IconType } from "react-icons";
import {
  SiInstagram,
  SiSnapchat,
  SiTelegram,
  SiX,
  SiBluesky,
} from "react-icons/si";

// Maps the `link.icon` column to a brand glyph. Keyed by both the chip-code
// placeholders used in the seed (IG, SC, …) and the platform slug, so either
// works. Platforms without a brand icon (Scruff, Recon, Asspig, JFF) simply
// aren't in the map and fall back to the styled initial chip.
const BRAND: Record<string, IconType> = {
  ig: SiInstagram,
  instagram: SiInstagram,
  sc: SiSnapchat,
  snapchat: SiSnapchat,
  tg: SiTelegram,
  telegram: SiTelegram,
  x: SiX,
  twitter: SiX,
  bs: SiBluesky,
  bluesky: SiBluesky,
};

export function getPlatformIcon(key: string | null | undefined): IconType | null {
  if (!key) return null;
  return BRAND[key.trim().toLowerCase()] ?? null;
}

/**
 * Renders the inner content of a chip: a monochrome brand icon (inherits the
 * chip's color via currentColor, so it ignites with the accent on hover) when
 * one is known, otherwise the initial-chip fallback text.
 */
export function ChipContent({
  icon,
  label,
  size = 18,
}: {
  icon: string | null | undefined;
  label: string;
  size?: number;
}) {
  const Icon = getPlatformIcon(icon);
  if (Icon) return <Icon size={size} aria-hidden focusable={false} />;
  return <>{icon ?? label.slice(0, 2)}</>;
}
