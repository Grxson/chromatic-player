import type { Album } from "@/domain/entities";

import { mockArtists } from "./artists";

export const mockAlbums: Album[] = [
  {
    id: "album-soft-static",
    title: "Soft Static",
    artists: [mockArtists[0]!, mockArtists[1]!],
    trackCount: 3,
    duration: 612,
    releaseDate: "2024-09-12",
  },
  {
    id: "album-echoes-in-amber",
    title: "Echoes in Amber",
    artists: [mockArtists[2]!],
    trackCount: 3,
    duration: 656,
    releaseDate: "2023-11-04",
  },
  {
    id: "album-velvet-hours",
    title: "Velvet Hours",
    artists: [mockArtists[0]!],
    trackCount: 3,
    duration: 642,
    releaseDate: "2024-02-22",
  },
  {
    id: "album-north-exit",
    title: "North Exit",
    artists: [mockArtists[3]!],
    trackCount: 3,
    duration: 638,
    releaseDate: "2024-05-30",
  },
  {
    id: "album-slow-collapse",
    title: "Slow Collapse",
    artists: [mockArtists[4]!],
    trackCount: 3,
    duration: 670,
    releaseDate: "2023-08-19",
  },
  {
    id: "album-glass-hours",
    title: "Glass Hours",
    artists: [mockArtists[5]!],
    trackCount: 3,
    duration: 624,
    releaseDate: "2025-01-17",
  },
  {
    id: "album-after-midnight",
    title: "After Midnight",
    artists: [mockArtists[1]!],
    trackCount: 3,
    duration: 660,
    releaseDate: "2024-12-03",
  },
  {
    id: "album-moraine",
    title: "Moraine",
    artists: [mockArtists[2]!],
    trackCount: 3,
    duration: 618,
    releaseDate: "2024-07-08",
  },
];
