import type { Album } from "./Album";
import type { Artist } from "./Artist";

/**
 * A playable audio item in Chromatic Player.
 *
 * Entities in the domain layer are provider-agnostic. They must not import
 * or reference TIDAL types, mappers or infrastructure modules.
 */
export interface Track {
  id: string;
  title: string;
  duration: number; // seconds
  artist: Artist;
  album?: Album;
  artworkUrl?: string;
  /** ISO 639-1 language hint when available. */
  language?: string;
  /** Provider-specific flags surfaced for the UI. */
  explicit?: boolean;
  /** Optional track number within its album. */
  trackNumber?: number;
}
