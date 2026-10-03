import type { Playlist } from "@/domain/entities";

import { mockTracks } from "./tracks";

/**
 * Hand-curated mock playlists. Track lists reference ids from
 * `mockTracks` so they stay in sync as the catalogue evolves.
 */
export const mockPlaylists: Playlist[] = [
  {
    id: "playlist-late-hours",
    name: "Late Hours",
    description: "Quiet moments for introspective evenings.",
    trackCount: 8,
    duration: 0,
    tracks: mockTracks.filter((t) =>
      [
        "track-slow-light",
        "track-velvet-echo",
        "track-quiet-room",
        "track-cold-hour",
        "track-paper-sky",
        "track-soft-engine",
        "track-night-form",
        "track-pale-water",
      ].includes(t.id),
    ),
  },
  {
    id: "playlist-soft-instrumentals",
    name: "Soft Instrumentals",
    description: "Slow movements and patient textures.",
    trackCount: 6,
    duration: 0,
    tracks: mockTracks.filter((t) =>
      [
        "track-slow-thread",
        "track-grey-signal",
        "track-paper-bell",
        "track-soft-exit",
        "track-quiet-river",
        "track-cold-room",
      ].includes(t.id),
    ),
  },
  {
    id: "playlist-midnight-drive",
    name: "Midnight Drive",
    description: "After-hours motion pictures.",
    trackCount: 6,
    duration: 0,
    tracks: mockTracks.filter((t) =>
      [
        "track-late-train",
        "track-still-water",
        "track-low-room",
        "track-pale-mountain",
        "track-grey-letter",
        "track-cold-letter",
      ].includes(t.id),
    ),
  },
  {
    id: "playlist-daylight-still",
    name: "Daylight, Still",
    description: "Quiet company for slow mornings.",
    trackCount: 6,
    duration: 0,
    tracks: mockTracks.filter((t) =>
      [
        "track-room-noise",
        "track-paper-bell",
        "track-soft-exit",
        "track-quiet-river",
        "track-paper-window",
        "track-pale-engine",
      ].includes(t.id),
    ),
  },
  {
    id: "playlist-ambient-tapes",
    name: "Ambient Tapes",
    description: "Field-recorded patience.",
    trackCount: 4,
    duration: 0,
    tracks: mockTracks.filter((t) =>
      [
        "track-slow-signal",
        "track-grey-signal",
        "track-room-noise-2",
        "track-cold-room-2",
      ].includes(t.id),
    ),
  },
];

// Materialise duration from tracks.
for (const playlist of mockPlaylists) {
  playlist.duration = playlist.tracks?.reduce((sum, t) => sum + t.duration, 0) ?? 0;
}
