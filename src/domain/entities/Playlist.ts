import type { Track } from "./Track";
import type { User } from "./User";

/**
 * Playlist entity. May be user-owned or curated by the provider.
 */
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  owner?: User;
  artworkUrl?: string;
  trackCount: number;
  duration: number; // seconds
  tracks?: Track[];
}
