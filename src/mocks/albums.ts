import type { Album } from "@/domain/entities";

import { mockArtists } from "./artists";

export const mockAlbums: Album[] = [
  {
    id: "album-1",
    title: "Soft Static",
    artists: [mockArtists[0]!, mockArtists[1]!],
    trackCount: 3,
    duration: 612,
    releaseDate: "2024-09-12",
  },
  {
    id: "album-2",
    title: "Echoes in Amber",
    artists: [mockArtists[2]!],
    trackCount: 2,
    duration: 438,
    releaseDate: "2023-11-04",
  },
];
