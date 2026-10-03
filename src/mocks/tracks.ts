import type { Track } from "@/domain/entities";

import { mockAlbums } from "./albums";
import { mockArtists } from "./artists";

export const mockTracks: Track[] = [
  {
    id: "track-1",
    title: "Slow Light",
    duration: 204,
    artist: mockArtists[0]!,
    album: mockAlbums[0],
    trackNumber: 1,
  },
  {
    id: "track-2",
    title: "Drift Theory",
    duration: 196,
    artist: mockArtists[1]!,
    album: mockAlbums[0],
    trackNumber: 2,
  },
  {
    id: "track-3",
    title: "Velvet Echo",
    duration: 212,
    artist: mockArtists[0]!,
    album: mockAlbums[0],
    trackNumber: 3,
  },
  {
    id: "track-4",
    title: "Amber Hymn",
    duration: 218,
    artist: mockArtists[2]!,
    album: mockAlbums[1],
    trackNumber: 1,
  },
  {
    id: "track-5",
    title: "Hollow Lullaby",
    duration: 220,
    artist: mockArtists[2]!,
    album: mockAlbums[1],
    trackNumber: 2,
  },
];
