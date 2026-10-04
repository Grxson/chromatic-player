import type { Album, Artist, Track } from "@/domain/entities";

const SUPPORTED_EXTENSIONS = new Set(["mp3", "flac", "wav", "m4a", "aac", "ogg"]);
const SUPPORTED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/flac",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "application/ogg",
]);

export function isSupportedAudioFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED_EXTENSIONS.has(extension) || SUPPORTED_MIME_TYPES.has(file.type.toLowerCase());
}

export interface ImportedLocalTrack {
  track: Track;
  audioUrl: string;
  artworkUrl?: string;
}

export async function mapLocalFile(file: File): Promise<ImportedLocalTrack> {
  if (!isSupportedAudioFile(file)) {
    throw new Error(`Unsupported audio format: ${file.name}`);
  }

  const { parseBlob } = await import("music-metadata");
  const metadata = await parseBlob(file, { skipCovers: false });
  const fileName = file.name.replace(/\.[^.]+$/, "").trim() || file.name;
  const id = `local:${crypto.randomUUID()}`;
  const artist: Artist = {
    id: `local-artist:${metadata.common.artist ?? "unknown"}`,
    name: metadata.common.artist?.trim() || "Unknown Artist",
  };
  const album: Album | undefined = metadata.common.album
    ? {
        id: `local-album:${metadata.common.album}`,
        title: metadata.common.album,
        artists: [artist],
        trackCount: 0,
        duration: 0,
        ...(metadata.common.picture?.[0]
          ? {
              artworkUrl: URL.createObjectURL(
                new Blob([metadata.common.picture[0].data.slice().buffer as ArrayBuffer], {
                  type: metadata.common.picture[0].format,
                }),
              ),
            }
          : {}),
      }
    : undefined;
  const artworkUrl = album?.artworkUrl;
  const track: Track = {
    id,
    playbackRef: id,
    title: metadata.common.title?.trim() || fileName,
    duration: metadata.format.duration ?? 0,
    artist,
    ...(album ? { album } : {}),
    ...(artworkUrl ? { artworkUrl } : {}),
    ...(metadata.common.track?.no ? { trackNumber: metadata.common.track.no } : {}),
  };

  return { track, audioUrl: URL.createObjectURL(file), ...(artworkUrl ? { artworkUrl } : {}) };
}
