import type { Track } from "@/domain/entities";

import { mockAlbums } from "./albums";
import { mockArtists } from "./artists";

/**
 * Hand-authored mock catalogue. Tracks belong to albums which belong to
 * artists. The order is intentional: album tracks are numbered 1..N so
 * playback contexts (album queue, artist popular, etc.) flow naturally.
 */
function buildAlbumTrack(
  id: string,
  title: string,
  duration: number,
  albumId: string,
  artistId: string,
  trackNumber: number,
): Track {
  const album = mockAlbums.find((a) => a.id === albumId)!;
  const artist = mockArtists.find((a) => a.id === artistId)!;
  return {
    id,
    title,
    duration,
    artist,
    album,
    trackNumber,
  };
}

export const mockTracks: Track[] = [
  buildAlbumTrack(
    "track-slow-light",
    "Slow Light",
    204,
    "album-soft-static",
    "artist-velvet-static",
    1,
  ),
  buildAlbumTrack(
    "track-drift-theory",
    "Drift Theory",
    196,
    "album-soft-static",
    "artist-after-midnight",
    2,
  ),
  buildAlbumTrack(
    "track-velvet-echo",
    "Velvet Echo",
    212,
    "album-soft-static",
    "artist-velvet-static",
    3,
  ),

  buildAlbumTrack(
    "track-amber-hymn",
    "Amber Hymn",
    218,
    "album-echoes-in-amber",
    "artist-moraine",
    1,
  ),
  buildAlbumTrack(
    "track-hollow-lullaby",
    "Hollow Lullaby",
    220,
    "album-echoes-in-amber",
    "artist-moraine",
    2,
  ),
  buildAlbumTrack(
    "track-quiet-room",
    "Quiet Room",
    218,
    "album-echoes-in-amber",
    "artist-moraine",
    3,
  ),

  buildAlbumTrack(
    "track-cold-hour",
    "Cold Hour",
    212,
    "album-velvet-hours",
    "artist-velvet-static",
    1,
  ),
  buildAlbumTrack(
    "track-paper-sky",
    "Paper Sky",
    214,
    "album-velvet-hours",
    "artist-velvet-static",
    2,
  ),
  buildAlbumTrack(
    "track-low-tide",
    "Low Tide",
    216,
    "album-velvet-hours",
    "artist-velvet-static",
    3,
  ),

  buildAlbumTrack(
    "track-soft-engine",
    "Soft Engine",
    210,
    "album-north-exit",
    "artist-north-exit",
    1,
  ),
  buildAlbumTrack(
    "track-night-form",
    "Night Form",
    214,
    "album-north-exit",
    "artist-north-exit",
    2,
  ),
  buildAlbumTrack(
    "track-late-train",
    "Late Train",
    214,
    "album-north-exit",
    "artist-north-exit",
    3,
  ),

  buildAlbumTrack(
    "track-pale-water",
    "Pale Water",
    222,
    "album-slow-collapse",
    "artist-slow-collapse",
    1,
  ),
  buildAlbumTrack(
    "track-slow-thread",
    "Slow Thread",
    222,
    "album-slow-collapse",
    "artist-slow-collapse",
    2,
  ),
  buildAlbumTrack(
    "track-grey-signal",
    "Grey Signal",
    226,
    "album-slow-collapse",
    "artist-slow-collapse",
    3,
  ),

  buildAlbumTrack(
    "track-room-noise",
    "Room Noise",
    208,
    "album-glass-hours",
    "artist-glass-hours",
    1,
  ),
  buildAlbumTrack(
    "track-paper-bell",
    "Paper Bell",
    208,
    "album-glass-hours",
    "artist-glass-hours",
    2,
  ),
  buildAlbumTrack(
    "track-cold-letter",
    "Cold Letter",
    208,
    "album-glass-hours",
    "artist-glass-hours",
    3,
  ),

  buildAlbumTrack(
    "track-still-water",
    "Still Water",
    220,
    "album-after-midnight",
    "artist-after-midnight",
    1,
  ),
  buildAlbumTrack(
    "track-low-room",
    "Low Room",
    220,
    "album-after-midnight",
    "artist-after-midnight",
    2,
  ),
  buildAlbumTrack(
    "track-pale-mountain",
    "Pale Mountain",
    220,
    "album-after-midnight",
    "artist-after-midnight",
    3,
  ),

  buildAlbumTrack("track-soft-exit", "Soft Exit", 206, "album-moraine", "artist-moraine", 1),
  buildAlbumTrack("track-quiet-river", "Quiet River", 206, "album-moraine", "artist-moraine", 2),
  buildAlbumTrack("track-cold-room", "Cold Room", 206, "album-moraine", "artist-moraine", 3),

  // Extra tracks for variety (used in search / popular lists)
  buildAlbumTrack(
    "track-paper-window",
    "Paper Window",
    210,
    "album-glass-hours",
    "artist-glass-hours",
    4,
  ),
  buildAlbumTrack(
    "track-grey-mountain",
    "Grey Mountain",
    210,
    "album-north-exit",
    "artist-north-exit",
    4,
  ),
  buildAlbumTrack(
    "track-pale-engine",
    "Pale Engine",
    210,
    "album-slow-collapse",
    "artist-slow-collapse",
    4,
  ),
  buildAlbumTrack(
    "track-slow-signal",
    "Slow Signal",
    210,
    "album-echoes-in-amber",
    "artist-moraine",
    4,
  ),
  buildAlbumTrack(
    "track-grey-letter",
    "Grey Letter",
    210,
    "album-velvet-hours",
    "artist-velvet-static",
    4,
  ),
  buildAlbumTrack(
    "track-cold-room-2",
    "Cold Room (Alt)",
    210,
    "album-moraine",
    "artist-moraine",
    4,
  ),
  buildAlbumTrack(
    "track-room-noise-2",
    "Room Noise (Alt)",
    210,
    "album-glass-hours",
    "artist-glass-hours",
    5,
  ),
  buildAlbumTrack(
    "track-still-water-2",
    "Still Water (Alt)",
    210,
    "album-after-midnight",
    "artist-after-midnight",
    4,
  ),
];
