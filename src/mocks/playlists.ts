import type { Playlist } from "@/domain/entities";

import { mockTracks } from "./tracks";

export const mockPlaylists: Playlist[] = [
  {
    id: "playlist-1",
    name: "Late Hours",
    description: "Quiet moments for introspective evenings.",
    trackCount: mockTracks.length,
    duration: mockTracks.reduce((sum, t) => sum + t.duration, 0),
    tracks: mockTracks,
  },
];
