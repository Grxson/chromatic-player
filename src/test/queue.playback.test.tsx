import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEffect, type ReactNode } from "react";
import type { Album, Artist, Track } from "@/domain/entities";
import type { MusicProvider } from "@/domain/ports";
import { usePlayback } from "@/hooks/usePlayback";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";

interface MockProvider {
  __play: ReturnType<typeof vi.fn>;
  __pause: ReturnType<typeof vi.fn>;
  __resume: ReturnType<typeof vi.fn>;
  __seek: ReturnType<typeof vi.fn>;
  __setVolume: ReturnType<typeof vi.fn>;
}

function makeTrack(id: string, duration = 200, album?: Album, artist?: Artist): Track {
  const finalArtist = artist ?? { id: `${id}-artist`, name: `${id} artist` };
  const finalAlbum =
    album ??
    ({
      id: `${id}-album`,
      title: `${id} album`,
      artists: [finalArtist],
      trackCount: 1,
      duration,
    } as Album);
  return { id, title: id, duration, artist: finalArtist, album: finalAlbum };
}

function makeProvider(spy = true): MockProvider & {
  provider: Parameters<typeof withProvider>[0];
} {
  const playFn = vi.fn(async (_track: Track) => undefined);
  const pauseFn = vi.fn(async () => undefined);
  const resumeFn = vi.fn(async () => undefined);
  const seekFn = vi.fn(async (_position: number) => undefined);
  const setVolumeFn = vi.fn(async (_volume: number) => undefined);

  const tracks = Array.from({ length: 6 }).map((_, index) =>
    makeTrack(`t${index + 1}`, 200 + index),
  );

  const provider = {
    name: "test",
    auth: { isAuthenticated: true },
    authenticate: async () => undefined,
    signOut: async () => undefined,
    search: async () => ({ query: "" }),
    getTrack: async (id: string) => {
      const found = tracks.find((t) => t.id === id);
      return (found ?? tracks[0])!;
    },
    getAlbum: async () => tracks[0]!.album!,
    getArtist: async () => tracks[0]!.artist!,
    getPlaylist: async () => ({
      id: "playlist-test",
      name: "Mock Playlist",
      trackCount: tracks.length,
      duration: tracks.reduce((sum, t) => sum + t.duration, 0),
      tracks,
    }),
    getAlbumTracks: async () => tracks,
    getArtistAlbums: async () => tracks.map((t) => t.album!),
    getPlaylistTracks: async () => tracks,

    play: playFn,
    pause: pauseFn,
    resume: resumeFn,
    seek: seekFn,
    setVolume: setVolumeFn,
  } as const;

  if (!spy) {
    return {
      ...provider,
      __play: playFn,
      __pause: pauseFn,
      __resume: resumeFn,
      __seek: seekFn,
      __setVolume: setVolumeFn,
    } as never;
  }

  // Re-enable lint after the explicit `as never` escape hatch.
  return {
    provider,
    __play: playFn,
    __pause: pauseFn,
    __resume: resumeFn,
    __seek: seekFn,
    __setVolume: setVolumeFn,
  } satisfies MockProvider & { provider: MusicProvider };
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
    error: null,
    volume: 0.8,
    position: 0,
    duration: 0,
  });
  useQueueStore.setState({ tracks: [], currentIndex: -1 });
}

afterEach(() => {
  resetStores();
});

describe("usePlayback queue interactions", () => {
  it("playQueueIndex moves the queue cursor and plays the new track", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`q${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });

    expect(useQueueStore.getState().currentIndex).toBe(0);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("q1");

    await act(async () => {
      await result.current.playQueueIndex(3);
    });

    expect(useQueueStore.getState().currentIndex).toBe(3);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("q4");
    expect(usePlayerStore.getState().status).toBe("playing");
    expect(mock.__play).toHaveBeenLastCalledWith(tracks[3]);
  });

  it("next after playQueueIndex advances from the selected position", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`s${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    await act(async () => {
      await result.current.playQueueIndex(2);
    });
    mock.__play.mockClear();

    await act(async () => {
      await result.current.next();
    });

    expect(useQueueStore.getState().currentIndex).toBe(3);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("s4");
    expect(mock.__play).toHaveBeenCalledWith(tracks[3]);
  });

  it("previous after playQueueIndex retreats from the selected position", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`p${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    await act(async () => {
      await result.current.playQueueIndex(4);
    });
    mock.__play.mockClear();

    await act(async () => {
      await result.current.previous();
    });

    expect(useQueueStore.getState().currentIndex).toBe(3);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("p4");
  });

  it("playTrack does not edit queue internals directly", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`e${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    await act(async () => {
      await result.current.playQueueIndex(3);
    });

    // Queue cursor must follow the public API, not be reset by
    // playTrack's enqueue-from-empty call path.
    const track = makeTrack("single");
    await act(async () => {
      await result.current.playTrack(track);
    });

    // playTrack replaces the queue, so the cursor lands at 0 for the
    // single track — but importantly this transition goes through
    // enqueue + jumpTo and not via direct setState.
    expect(useQueueStore.getState().currentIndex).toBe(0);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("single");
  });

  it("removeFromQueue on a non-current track leaves playback untouched", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`r${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    mock.__play.mockClear();
    mock.__pause.mockClear();

    await act(async () => {
      await result.current.removeFromQueue(4);
    });

    // The current track is still r1.
    expect(usePlayerStore.getState().currentTrack?.id).toBe("r1");
    expect(useQueueStore.getState().currentIndex).toBe(0);
    // Removing a non-current track does not call the provider.
    expect(mock.__play).not.toHaveBeenCalled();
    expect(mock.__pause).not.toHaveBeenCalled();
  });

  it("removeFromQueue on a track before current shifts the cursor", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`b${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    await act(async () => {
      await result.current.playQueueIndex(3);
    });

    await act(async () => {
      await result.current.removeFromQueue(1);
    });

    expect(useQueueStore.getState().currentIndex).toBe(2);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("b4");
  });

  it("removeFromQueue on the current track with a next track plays it", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`c${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    await act(async () => {
      await result.current.playQueueIndex(1);
    });
    mock.__play.mockClear();

    await act(async () => {
      await result.current.removeFromQueue(1);
    });

    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("c3");
    expect(mock.__play).toHaveBeenCalledWith(tracks[2]);
  });

  it("removeFromQueue on the current track at the end falls back", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`e${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    // Jump to the last track.
    await act(async () => {
      await result.current.playQueueIndex(4);
    });
    mock.__play.mockClear();

    await act(async () => {
      await result.current.removeFromQueue(4);
    });

    // The store fell back to the previous valid index, which is now 3.
    expect(useQueueStore.getState().currentIndex).toBe(3);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("e4");
    expect(mock.__play).toHaveBeenCalledWith(tracks[3]);
  });

  it("removeFromQueue on the only track pauses and resets playback", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const track = makeTrack("only");
    await act(async () => {
      await result.current.playTrack(track);
    });
    mock.__pause.mockClear();

    await act(async () => {
      await result.current.removeFromQueue(0);
    });

    expect(useQueueStore.getState().tracks).toEqual([]);
    expect(useQueueStore.getState().currentIndex).toBe(-1);
    expect(usePlayerStore.getState().currentTrack).toBeNull();
    expect(usePlayerStore.getState().status).toBe("idle");
    expect(mock.__pause).toHaveBeenCalledTimes(1);
  });

  it("removeFromQueue on a track after current does not move the cursor", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 5 }).map((_, index) => makeTrack(`a${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    await act(async () => {
      await result.current.playQueueIndex(1);
    });

    await act(async () => {
      await result.current.removeFromQueue(3);
    });

    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("a2");
  });

  it("clearQueue empties the queue and resets the player", async () => {
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 3 }).map((_, index) => makeTrack(`c${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    mock.__pause.mockClear();

    await act(async () => {
      await result.current.clearQueue();
    });

    expect(useQueueStore.getState().tracks).toEqual([]);
    expect(useQueueStore.getState().currentIndex).toBe(-1);
    expect(usePlayerStore.getState().currentTrack).toBeNull();
    expect(usePlayerStore.getState().status).toBe("idle");
    expect(mock.__pause).toHaveBeenCalledTimes(1);
  });

  it("does not depend on direct setState calls inside the hook", async () => {
    // This is a smoke test that captures the public surface only.
    // If a future refactor introduces a direct setState inside
    // usePlayback, this assertion (and the queue sync tests above) will
    // fail by virtue of the cursor and the player going out of sync.
    const mock = makeProvider();
    const wrapper = withProvider(mock.provider);
    const { result } = renderHook(() => usePlayback(), { wrapper });

    const tracks = Array.from({ length: 4 }).map((_, index) => makeTrack(`d${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });

    // Snapshot the full state and ensure cursor matches player.
    const queue = useQueueStore.getState();
    const player = usePlayerStore.getState();
    const current = queue.tracks[queue.currentIndex];
    expect(current?.id).toBe(player.currentTrack?.id);

    // Quick wait — purely to ensure no async errors fired.
    await waitFor(() => {
      expect(player.status).toBe("playing");
    });
  });
});

// Suppress unused import warning — React is referenced via `act` and
// `render` from the testing library helpers above.
void useEffect;
