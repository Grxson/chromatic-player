import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { Album, Track } from "@/domain/entities";
import { useMuteMemory } from "@/hooks/useMuteMemory";
import { usePlayerStore } from "@/stores/player.store";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import type { MusicProvider } from "@/domain/ports";

function makeProvider(): MusicProvider {
  const artist = { id: "a", name: "A" };
  const album: Album = {
    id: "album",
    title: "Album",
    artists: [artist],
    trackCount: 1,
    duration: 200,
  };
  const track: Track = { id: "t", title: "T", artist, album, duration: 200 };
  return {
    name: "test",
    auth: { isAuthenticated: true },
    authenticate: async () => undefined,
    signOut: async () => undefined,
    search: async () => ({ query: "" }),
    getTrack: async () => track,
    getAlbum: async () => album,
    getArtist: async () => artist,
    getPlaylist: async () => ({
      id: "playlist-test",
      name: "Mock Playlist",
      trackCount: 1,
      duration: 200,
      tracks: [track],
    }),
    getAlbumTracks: async () => [track],
    getArtistAlbums: async () => [album],
    getPlaylistTracks: async () => [track],
    play: vi.fn(async () => undefined),
    pause: vi.fn(async () => undefined),
    resume: vi.fn(async () => undefined),
    seek: vi.fn(async () => undefined),
    setVolume: vi.fn(async () => undefined),
  };
}

function withProvider(provider: MusicProvider) {
  return ({ children }: { children: ReactNode }) => (
    <MusicProviderContext.Provider value={{ provider }}>
      {children}
    </MusicProviderContext.Provider>
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
}

afterEach(() => {
  resetStores();
});

describe("useMuteMemory", () => {
  it("muted reflects volume === 0", () => {
    const provider = makeProvider();
    usePlayerStore.setState({ volume: 0.3 });
    const { result } = renderHook(() => useMuteMemory(), { wrapper: withProvider(provider) });
    expect(result.current.muted).toBe(false);

    act(() => {
      usePlayerStore.getState().setVolume(0);
    });
    expect(result.current.muted).toBe(true);
  });

  it("toggle mutes and restores previous volume", async () => {
    const provider = makeProvider();
    usePlayerStore.setState({ volume: 0.55 });
    const { result } = renderHook(() => useMuteMemory(), { wrapper: withProvider(provider) });

    await act(async () => {
      await result.current.toggle();
    });
    expect(usePlayerStore.getState().volume).toBe(0);

    await act(async () => {
      await result.current.toggle();
    });
    expect(usePlayerStore.getState().volume).toBe(0.55);
  });

  it("falls back to a default restore when no prior volume is stashed", async () => {
    const provider = makeProvider();
    usePlayerStore.setState({ volume: 0 });
    const { result } = renderHook(() => useMuteMemory(), { wrapper: withProvider(provider) });

    await act(async () => {
      await result.current.toggle();
    });
    expect(usePlayerStore.getState().volume).toBe(0.8);
  });
});