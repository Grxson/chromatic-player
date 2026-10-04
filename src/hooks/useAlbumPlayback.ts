import { useCallback, useRef, useState } from "react";
import type { Album, Track } from "@/domain/entities";
import { useCatalogProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";

export interface AlbumPlaybackController {
  loadingAlbumId: string | null;
  error: string | null;
  playAlbum: (album: Album, tracks?: Track[], startIndex?: number) => Promise<void>;
}

/** Loads an album queue before replacing the current queue, then starts at the requested track. */
export function useAlbumPlayback(): AlbumPlaybackController {
  const catalog = useCatalogProvider();
  const playback = usePlayback();
  const [loadingAlbumId, setLoadingAlbumId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const playAlbum = useCallback(
    async (album: Album, cachedTracks?: Track[], startIndex = 0) => {
      if (pendingRef.current) {
        return;
      }
      pendingRef.current = true;
      setLoadingAlbumId(album.id);
      setError(null);
      try {
        const tracks = cachedTracks ?? (await catalog.getAlbumTracks(album.id));
        if (tracks.length === 0) {
          setError("This album has no playable tracks.");
          return;
        }
        await playback.playQueue(tracks, startIndex, { type: "album", id: album.id });
      } catch {
        setError("Could not load this album's tracks. Please try again.");
      } finally {
        pendingRef.current = false;
        setLoadingAlbumId(null);
      }
    },
    [catalog, playback],
  );

  return { loadingAlbumId, error, playAlbum };
}
