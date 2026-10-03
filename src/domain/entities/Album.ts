import type { Artist } from "./Artist";

/**
 * Album entity. A collection of tracks credited to one or more artists.
 */
export interface Album {
  id: string;
  title: string;
  artists: Artist[];
  artworkUrl?: string;
  releaseDate?: string; // ISO-8601
  trackCount: number;
  duration: number; // seconds
  /** Provider-specific flags surfaced for the UI. */
  explicit?: boolean;
}
