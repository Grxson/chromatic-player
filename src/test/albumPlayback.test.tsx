import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ReactNode } from "react";
import type { Album, Track } from "@/domain/entities";
import type { MusicProvider } from "@/domain/ports";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import { useAlbumPlayback } from "@/hooks/useAlbumPlayback";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";

const album: Album = {
  id: "album-1",
  title: "Album One",
  artists: [{ id: "artist-1", name: "Artist One" }],
  trackCount: 3,
  duration: 300,
};
const tracks: Track[] = [1, 2, 3].map((number) => ({
  id: `track-${number}`,
  title: `Track ${number}`,
  duration: 100,
  artist: album.artists[0]!,
  album,
  trackNumber: number,
}));

function makeProvider(getAlbumTracks = vi.fn(async () => tracks)) {
  return {
    name: "test",
    search: vi.fn(async () => ({ query: "" })),
    getTrack: vi.fn(async () => tracks[0]!),
    getAlbum: vi.fn(async () => album),
    getArtist: vi.fn(async () => album.artists[0]!),
    getPlaylist: vi.fn(async () => ({
      id: "playlist",
      name: "Playlist",
      trackCount: 0,
      duration: 0,
      tracks: [],
    })),
    getAlbumTracks,
    getArtistAlbums: vi.fn(async () => [album]),
    getPlaylistTracks: vi.fn(async () => []),
    play: vi.fn(async (_track: Track) => undefined),
    pause: vi.fn(async () => undefined),
    resume: vi.fn(async () => undefined),
    seek: vi.fn(async (_position: number) => undefined),
    setVolume: vi.fn(async (_volume: number) => undefined),
  } as unknown as MusicProvider;
}

function withProvider(provider: MusicProvider) {
  return ({ children }: { children: ReactNode }) => (
    <MusicProviderContext.Provider value={{ provider }}>{children}</MusicProviderContext.Provider>
  );
}

function resetStores() {
  usePlayerStore.setState({
    currentTrack: null,
    status: "idle",
    position: 0,
    duration: 0,
    error: null,
  });
  useQueueStore.setState({ tracks: [], currentIndex: -1, source: null });
}

afterEach(() => {
  resetStores();
});

describe("useAlbumPlayback", () => {
  it("loads and starts the full album queue at the selected track with album context", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => useAlbumPlayback(), { wrapper: withProvider(provider) });

    await act(async () => {
      await result.current.playAlbum(album, undefined, 1);
    });

    expect(provider.getAlbumTracks).toHaveBeenCalledWith(album.id);
    expect(useQueueStore.getState().tracks.map((track) => track.id)).toEqual([
      "track-1",
      "track-2",
      "track-3",
    ]);
    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(useQueueStore.getState().source).toEqual({ type: "album", id: album.id });
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");
    expect(provider.play).toHaveBeenCalledWith(tracks[1]);
  });

  it("does not replace the current queue if album tracks fail to load", async () => {
    const provider = makeProvider(vi.fn(async () => Promise.reject(new Error("offline"))));
    useQueueStore.setState({ tracks, currentIndex: 2, source: { type: "queue" } });
    const { result } = renderHook(() => useAlbumPlayback(), { wrapper: withProvider(provider) });

    await act(async () => {
      await result.current.playAlbum(album);
    });

    expect(useQueueStore.getState().tracks).toBe(tracks);
    expect(useQueueStore.getState().currentIndex).toBe(2);
    expect(result.current.error).toMatch(/could not load/i);
  });
});
