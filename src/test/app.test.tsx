import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Album, Track } from "@/domain/entities";
import type { MusicProvider } from "@/domain/ports";
import { App } from "@/app/App";
import {
  MusicCatalogContext,
  MusicProviderContext,
  PlaybackBackendContext,
} from "@/app/providers/useMusicProvider";
import { RouterContext } from "@/app/router/useRouter";
import { useAuthStore } from "@/stores/auth.store";

const album: Album = {
  id: "album-1",
  title: "Album One",
  artists: [{ id: "artist-1", name: "Artist One" }],
  trackCount: 1,
  duration: 200,
};
const track: Track = {
  id: "track-1",
  title: "Track One",
  duration: 200,
  artist: album.artists[0]!,
  album,
};

function makeProvider() {
  return {
    name: "test",
    auth: { isAuthenticated: true },
    search: vi.fn(async () => ({ query: "", tracks: [], albums: [], artists: [], playlists: [] })),
    getTrack: vi.fn(async () => track),
    getAlbum: vi.fn(async () => album),
    getArtist: vi.fn(async () => album.artists[0]!),
    getPlaylist: vi.fn(async () => ({
      id: "playlist-1",
      name: "Playlist",
      trackCount: 0,
      duration: 0,
      tracks: [],
    })),
    getAlbumTracks: vi.fn(async () => [track]),
    getArtistAlbums: vi.fn(async () => [album]),
    getPlaylistTracks: vi.fn(async () => []),
    play: vi.fn(async () => undefined),
    pause: vi.fn(async () => undefined),
    resume: vi.fn(async () => undefined),
    seek: vi.fn(async () => undefined),
    setVolume: vi.fn(async () => undefined),
  } as unknown as MusicProvider;
}

afterEach(() => {
  useAuthStore.getState().reset();
  document.body.innerHTML = "";
});

describe("App startup", () => {
  it("waits for TIDAL auth initialization before loading a direct album route", async () => {
    const provider = makeProvider();
    useAuthStore.setState({ status: "initializing" });

    render(
      <MusicProviderContext.Provider value={{ provider }}>
        <MusicCatalogContext.Provider value={provider}>
          <PlaybackBackendContext.Provider value={provider}>
            <RouterContext.Provider
              value={{ route: { type: "album", id: album.id }, navigate: vi.fn() }}
            >
              <App />
            </RouterContext.Provider>
          </PlaybackBackendContext.Provider>
        </MusicCatalogContext.Provider>
      </MusicProviderContext.Provider>,
    );

    expect(screen.getByRole("status", { name: "Loading TIDAL session" })).toBeTruthy();
    expect(provider.getAlbum).not.toHaveBeenCalled();

    act(() => {
      useAuthStore.getState().setState({ status: "authenticated" });
    });

    await waitFor(() => expect(provider.getAlbum).toHaveBeenCalledWith(album.id));
  });
});
