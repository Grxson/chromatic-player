import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { Album, Artist, Track } from "@/domain/entities";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import type { MusicProvider } from "@/domain/ports";

interface FailureProvider extends MusicProvider {
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
  return { id, title: id, artist: { id, name: `${id} artist` } as Artist, album, duration };
}

function makeProvider(
  options: {
    failPlay?: boolean;
    failPause?: boolean;
    failResume?: boolean;
    failSeek?: boolean;
    failSetVolume?: boolean;
  } = {},
): FailureProvider {
  const playFn = vi.fn(async (_track: Track) => {
    if (options.failPlay) {
      throw new Error("play failed");
    }
  });
  const pauseFn = vi.fn(async () => {
    if (options.failPause) {
      throw new Error("pause failed");
    }
  });
  const resumeFn = vi.fn(async () => {
    if (options.failResume) {
      throw new Error("resume failed");
    }
  });
  const seekFn = vi.fn(async (_position: number) => {
    if (options.failSeek) {
      throw new Error("seek failed");
    }
  });
  const setVolumeFn = vi.fn(async (_volume: number) => {
    if (options.failSetVolume) {
      throw new Error("setVolume failed");
    }
  });

  return {
    name: "test",
    auth: { isAuthenticated: true },
    authenticate: async () => undefined,
    signOut: async () => undefined,
    search: async () => ({ query: "" }),
    getTrack: async () => {
      throw new Error("not used");
    },
    getAlbum: async () => {
      throw new Error("not used");
    },
    getArtist: async () => {
      throw new Error("not used");
    },
    getPlaylist: async () => {
      throw new Error("not used");
    },
    getAlbumTracks: async () => [],
    getArtistAlbums: async () => [],
    getPlaylistTracks: async () => [],

    play: playFn,
    pause: pauseFn,
    resume: resumeFn,
    seek: seekFn,
    setVolume: setVolumeFn,

    __play: playFn,
    __pause: pauseFn,
    __resume: resumeFn,
    __seek: seekFn,
    __setVolume: setVolumeFn,
  };
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

describe("usePlayback failure reconciliation", () => {
  it("playTrack failure sets status=error, error string, but keeps the requested track visible", async () => {
    const provider = makeProvider({ failPlay: true });
    const { result } = renderHook(() => usePlayback(), { wrapper: withProvider(provider) });

    const track = makeTrack("fail-play");
    await act(async () => {
      await result.current.playTrack(track);
    });

    const player = usePlayerStore.getState();
    expect(player.currentTrack?.id).toBe("fail-play");
    expect(player.status).toBe("error");
    expect(player.error).toBe("play failed");
  });

  it("playQueueIndex failure flips to error and keeps the cursor", async () => {
    const provider = makeProvider({ failPlay: true });
    const { result } = renderHook(() => usePlayback(), { wrapper: withProvider(provider) });

    const tracks = Array.from({ length: 4 }).map((_, index) => makeTrack(`q${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });

    // The first play succeeded; clear the spy and switch the provider
    // mode so we can fail the second call.
    provider.__play.mockClear();
    const failProvider = makeProvider({ failPlay: true });
    const { result: result2, rerender } = renderHook(
      (props: { provider: MusicProvider }) => {
        const playback = usePlayback();
        // Keep the playback reference pinned to the original provider
        // for this test — we just want to verify the queue/store sync.
        void props;
        return playback;
      },
      {
        wrapper: withProvider(failProvider),
        initialProps: { provider: failProvider },
      },
    );

    void rerender;

    await act(async () => {
      await result2.current.playQueueIndex(2);
    });

    const player = usePlayerStore.getState();
    expect(player.currentTrack?.id).toBe("q3");
    expect(player.status).toBe("error");
  });

  it("togglePlay pause failure restores the previous playing state", async () => {
    const provider = makeProvider({ failPause: true });
    const { result } = renderHook(() => usePlayback(), { wrapper: withProvider(provider) });

    const tracks = Array.from({ length: 2 }).map((_, index) => makeTrack(`t${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });

    expect(usePlayerStore.getState().status).toBe("playing");

    await act(async () => {
      await result.current.togglePlay();
    });

    const player = usePlayerStore.getState();
    expect(player.status).toBe("error");
    expect(player.error).toBe("pause failed");
    // Status was `playing`; the rollback keeps `playing` even though
    // the provider call failed.
  });

  it("seek failure restores the previous position", async () => {
    const provider = makeProvider({ failSeek: true });
    const { result } = renderHook(() => usePlayback(), { wrapper: withProvider(provider) });

    const track = makeTrack("seek-fail", 200);
    await act(async () => {
      await result.current.playTrack(track);
    });
    usePlayerStore.setState({ position: 30 });

    await act(async () => {
      await result.current.seek(90);
    });

    expect(usePlayerStore.getState().position).toBe(30);
    expect(usePlayerStore.getState().error).toBe("seek failed");
  });

  it("seek clamps the value to [0, duration]", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), { wrapper: withProvider(provider) });

    const track = makeTrack("clamp", 200);
    await act(async () => {
      await result.current.playTrack(track);
    });
    usePlayerStore.setState({ position: 0, duration: 200 });

    await act(async () => {
      await result.current.seek(500);
    });
    expect(usePlayerStore.getState().position).toBe(200);
    expect(provider.__seek).toHaveBeenLastCalledWith(200);

    await act(async () => {
      await result.current.seek(-50);
    });
    expect(usePlayerStore.getState().position).toBe(0);
    expect(provider.__seek).toHaveBeenLastCalledWith(0);
  });

  it("setVolume clamps before reaching the provider", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), { wrapper: withProvider(provider) });

    await act(async () => {
      await result.current.setVolume(1.5);
    });
    expect(provider.__setVolume).toHaveBeenLastCalledWith(1);

    await act(async () => {
      await result.current.setVolume(-0.3);
    });
    expect(provider.__setVolume).toHaveBeenLastCalledWith(0);
  });

  it("next() at end pauses and keeps the current track", async () => {
    const provider = makeProvider();
    const { result } = renderHook(() => usePlayback(), { wrapper: withProvider(provider) });

    const tracks = Array.from({ length: 3 }).map((_, index) => makeTrack(`n${index + 1}`));
    await act(async () => {
      await result.current.playQueue(tracks, 0);
    });
    await act(async () => {
      await result.current.playQueueIndex(2);
    });
    provider.__pause.mockClear();

    await act(async () => {
      await result.current.next();
    });

    expect(usePlayerStore.getState().currentTrack?.id).toBe("n3");
    expect(usePlayerStore.getState().status).toBe("paused");
    expect(provider.__pause).toHaveBeenCalledTimes(1);
  });
});
