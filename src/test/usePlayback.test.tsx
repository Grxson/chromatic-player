import { act, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEffect, type ReactNode } from "react";
import type { MusicProvider } from "@/domain/ports";
import type { Album, Artist, Track } from "@/domain/entities";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import { useMusicProvider } from "@/app/providers/useMusicProvider";

interface MockProvider extends MusicProvider {
  __play: ReturnType<typeof vi.fn>;
  __pause: ReturnType<typeof vi.fn>;
  __resume: ReturnType<typeof vi.fn>;
  __seek: ReturnType<typeof vi.fn>;
  __setVolume: ReturnType<typeof vi.fn>;
}

function makeTrack(id: string, duration = 200): Track {
  const artist: Artist = { id: `${id}-artist`, name: `${id} artist` };
  const album: Album = {
    id: `${id}-album`,
    title: `${id} album`,
    artists: [artist],
    trackCount: 1,
    duration,
  };
  return { id, title: id, duration, artist, album };
}

function makeProvider(): MockProvider {
  const tracks: Track[] = [makeTrack("a"), makeTrack("b"), makeTrack("c")];

  const playFn = vi.fn(async (_track: Track) => undefined);
  const pauseFn = vi.fn(async () => undefined);
  const resumeFn = vi.fn(async () => undefined);
  const seekFn = vi.fn(async (_position: number) => undefined);
  const setVolumeFn = vi.fn(async (_volume: number) => undefined);

  return {
    name: "test",
    auth: { isAuthenticated: true },

    __play: playFn,
    __pause: pauseFn,
    __resume: resumeFn,
    __seek: seekFn,
    __setVolume: setVolumeFn,

    authenticate: async () => undefined,
    signOut: async () => undefined,
    search: async () => ({ query: "" }),
    getTrack: async (id: string) => tracks.find((t) => t.id === id) ?? tracks[0]!,
    getAlbum: async (id: string) => {
          const match = tracks.find((t) => t.id === id);
          return (match ?? tracks[0]!).album!;
        },
    getArtist: async () => tracks[0]!.artist,
    getPlaylist: async () => ({
      id: "playlist-test",
      name: "Mock Playlist",
      trackCount: tracks.length,
      duration: tracks.reduce((sum, t) => sum + t.duration, 0),
      tracks,
    }),
    getAlbumTracks: async () => tracks,
    getArtistAlbums: async () => [],
    getPlaylistTracks: async () => tracks,

    // Aliases so the hook sees the same spy when it calls `provider.play(...)`.
    play: playFn,
    pause: pauseFn,
    resume: resumeFn,
    seek: seekFn,
    setVolume: setVolumeFn,
  };
}

function withProvider(provider: MusicProvider) {
  return ({ children }: { children: ReactNode }) => (
    <MusicProviderContext.Provider value={{ provider }}>{children}</MusicProviderContext.Provider>
  );
}

afterEach(() => {
  usePlayerStore.setState({
    currentTrack: null,
    status: "idle",
    volume: 0.8,
    position: 0,
    duration: 0,
  });
  useQueueStore.setState({ tracks: [], currentIndex: -1 });
});

describe("usePlayback", () => {
  it("playTrack replaces the queue with a single track and calls provider.play", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    const track = makeTrack("only", 180);
    await act(async () => {
      await result.current.playTrack(track);
    });

    const queue = useQueueStore.getState();
    expect(queue.tracks.map((t) => t.id)).toEqual(["only"]);
    expect(queue.currentIndex).toBe(0);

    const player = usePlayerStore.getState();
    expect(player.currentTrack?.id).toBe("only");
    expect(player.status).toBe("playing");

    expect(provider.__play).toHaveBeenCalledTimes(1);
    expect(provider.__play).toHaveBeenCalledWith(track);
  });

  it("playQueue loads the queue, jumps to the start index and plays", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    const tracks = [makeTrack("p0"), makeTrack("p1"), makeTrack("p2"), makeTrack("p3")];

    await act(async () => {
      await result.current.playQueue(tracks, 2);
    });

    const queue = useQueueStore.getState();
    expect(queue.tracks.map((t) => t.id)).toEqual(["p0", "p1", "p2", "p3"]);
    expect(queue.currentIndex).toBe(2);

    const player = usePlayerStore.getState();
    expect(player.currentTrack?.id).toBe("p2");
    expect(player.status).toBe("playing");

    expect(provider.__play).toHaveBeenCalledWith(tracks[2]);
  });

  it("playQueue clamps the start index to a valid range", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    const tracks = [makeTrack("a"), makeTrack("b")];

    await act(async () => {
      await result.current.playQueue(tracks, 99);
    });

    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("b");
  });

  it("next advances the cursor and asks the provider to play the new track", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    const tracks = [makeTrack("n0"), makeTrack("n1"), makeTrack("n2")];
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    provider.__play.mockClear();

    await act(async () => {
      await result.current.next();
    });

    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("n1");
    expect(provider.__play).toHaveBeenCalledWith(tracks[1]);
  });

  it("next at the end of the queue pauses and keeps the current track visible", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    const tracks = [makeTrack("e0"), makeTrack("e1")];
    await act(async () => {
      await result.current.playQueue(tracks, 1);
    });
    provider.__play.mockClear();
    provider.__pause.mockClear();

    await act(async () => {
      await result.current.next();
    });

    expect(useQueueStore.getState().currentIndex).toBe(1);
    expect(provider.__pause).toHaveBeenCalledTimes(1);
    expect(provider.__play).not.toHaveBeenCalled();
    expect(usePlayerStore.getState().status).toBe("paused");
  });

  it("previous rewinds the position when at the start of the queue", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    const tracks = [makeTrack("p0"), makeTrack("p1")];
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    usePlayerStore.setState({ position: 90 });
    provider.__seek.mockClear();
    provider.__play.mockClear();

    await act(async () => {
      await result.current.previous();
    });

    expect(usePlayerStore.getState().position).toBe(0);
    expect(provider.__seek).toHaveBeenCalledWith(0);
    expect(provider.__play).not.toHaveBeenCalled();
  });

  it("seek updates the store position and forwards to the provider", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    await act(async () => {
      await result.current.seek(42);
    });

    expect(usePlayerStore.getState().position).toBe(42);
    expect(provider.__seek).toHaveBeenCalledWith(42);
  });

  it("setVolume updates the store and forwards to the provider", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    await act(async () => {
      await result.current.setVolume(0.5);
    });

    expect(usePlayerStore.getState().volume).toBe(0.5);
    expect(provider.__setVolume).toHaveBeenCalledWith(0.5);
  });

  it("clearQueue empties stores and pauses the provider", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), {
      wrapper: withProvider(provider),
    });

    await act(async () => {
      await result.current.playTrack(makeTrack("clearable"));
    });

    expect(useQueueStore.getState().tracks.length).toBeGreaterThan(0);

    await act(async () => {
      await result.current.clearQueue();
    });

    expect(useQueueStore.getState().tracks).toEqual([]);
    expect(usePlayerStore.getState().currentTrack).toBeNull();
    expect(usePlayerStore.getState().status).toBe("idle");
    expect(provider.__pause).toHaveBeenCalled();
  });

  it("uses the consumer hook to read the provider", () => {
    const provider = makeProvider();
    const { result } = renderHook(() => useMusicProvider(), {
      wrapper: withProvider(provider),
    });
    expect(result.current).toBe(provider);
  });

  it("renders without crashing inside a component", async () => {
    const provider = makeProvider();
    function Demo() {
      const playback = usePlayback();
      const p = useMusicProvider();
      useEffect(() => {
        void playback;
        void p;
      }, [playback, p]);
      return null;
    }
    const { container } = render(<Demo />, { wrapper: withProvider(provider) });
    expect(container).toBeDefined();
    await waitFor(() => {
      expect(usePlayerStore.getState().status).toBe("idle");
    });
  });
});
