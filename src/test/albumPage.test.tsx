import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Album, Track } from "@/domain/entities";
import type { MusicProvider } from "@/domain/ports";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import { RouterContext } from "@/app/router/useRouter";
import type { Route } from "@/app/router/router";
import { AlbumPage } from "@/pages/AlbumPage";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";

const album: Album = {
  id: "white-pony",
  title: "White Pony",
  artists: [{ id: "deftones", name: "Deftones" }],
  trackCount: 3,
  duration: 800,
  releaseDate: "2000-06-20",
};
const tracks: Track[] = ["Change", "Digital Bath", "Elite"].map((title, index) => ({
  id: `track-${index + 1}`,
  title,
  duration: 200 + index,
  trackNumber: index + 1,
  artist: album.artists[0]!,
  album,
}));

function makeProvider() {
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
    getAlbumTracks: vi.fn(async () => tracks),
    getArtistAlbums: vi.fn(async () => [album]),
    getPlaylistTracks: vi.fn(async () => []),
    play: vi.fn(async (_track: Track) => undefined),
    pause: vi.fn(async () => undefined),
    resume: vi.fn(async () => undefined),
    seek: vi.fn(async (_position: number) => undefined),
    setVolume: vi.fn(async (_volume: number) => undefined),
  } as unknown as MusicProvider;
}

function renderAlbumPage(provider: MusicProvider, navigate = vi.fn()) {
  const route: Route = { type: "album", id: album.id };
  const rendered = render(
    <MusicProviderContext.Provider value={{ provider }}>
      <RouterContext.Provider value={{ route, navigate }}>
        <AlbumPage albumId={album.id} />
      </RouterContext.Provider>
    </MusicProviderContext.Provider>,
  );
  return { ...rendered, navigate };
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
  document.body.innerHTML = "";
});

describe("AlbumPage", () => {
  it("loads tracks in provider order and plays a selected track with the complete album queue", async () => {
    const provider = makeProvider();
    const { navigate } = renderAlbumPage(provider);

    expect(await screen.findByRole("heading", { level: 2, name: "White Pony" })).toBeTruthy();
    expect(provider.getAlbum).toHaveBeenCalledWith(album.id);
    expect(provider.getAlbumTracks).toHaveBeenCalledWith(album.id);
    expect(screen.getByText("Change")).toBeTruthy();
    expect(screen.getByText("Digital Bath")).toBeTruthy();
    expect(screen.getByText("Elite")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Play Digital Bath" }));
    await waitFor(() => expect(useQueueStore.getState().currentIndex).toBe(1));
    expect(useQueueStore.getState().tracks.map((track) => track.id)).toEqual([
      "track-1",
      "track-2",
      "track-3",
    ]);
    expect(useQueueStore.getState().source).toEqual({ type: "album", id: album.id });
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");
    expect(provider.play).toHaveBeenCalledWith(tracks[1]);

    fireEvent.click(screen.getAllByRole("button", { name: "Open artist Deftones" })[0]!);
    expect(navigate).toHaveBeenCalledWith({ type: "artist", id: "deftones" });
  });

  it("shows an album error instead of a blank page when catalogue loading fails", async () => {
    const provider = makeProvider();
    vi.mocked(provider.getAlbumTracks).mockRejectedValue(new Error("offline"));
    renderAlbumPage(provider);

    expect(await screen.findByText("We couldn't load this album")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Search" })).toBeTruthy();
  });

  it("plays the loaded album from its first track", async () => {
    const provider = makeProvider();
    renderAlbumPage(provider);

    fireEvent.click(await screen.findByRole("button", { name: "Play album" }));
    await waitFor(() => expect(useQueueStore.getState().currentIndex).toBe(0));
    expect(useQueueStore.getState().tracks).toHaveLength(3);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("track-1");
  });
});
