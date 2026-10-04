import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Track } from "@/domain/entities";
import type { MusicProvider } from "@/domain/ports";
import { MusicProviderContext } from "@/app/providers/useMusicProvider";
import { QueueDrawer } from "@/features/queue/QueueDrawer";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";

const artist = { id: "artist", name: "Deftones" };
const album = {
  id: "album",
  title: "Koi No Yokan",
  artists: [artist],
  trackCount: 4,
  duration: 900,
};
const tracks: Track[] = ["Swerve City", "Romantic Dreams", "Leathers", "Poltergeist"].map(
  (title, index) => ({
    id: `track-${index + 1}`,
    title,
    duration: 200 + index,
    trackNumber: index + 1,
    artist,
    album,
  }),
);

const provider = {
  name: "test",
  search: vi.fn(async () => ({ query: "" })),
  getTrack: vi.fn(async () => tracks[0]!),
  getAlbum: vi.fn(async () => album),
  getArtist: vi.fn(async () => artist),
  getPlaylist: vi.fn(async () => ({
    id: "playlist",
    name: "Playlist",
    trackCount: 0,
    duration: 0,
  })),
  getAlbumTracks: vi.fn(async () => tracks),
  getArtistAlbums: vi.fn(async () => [album]),
  getPlaylistTracks: vi.fn(async () => []),
  play: vi.fn(async () => undefined),
  pause: vi.fn(async () => undefined),
  resume: vi.fn(async () => undefined),
  seek: vi.fn(async () => undefined),
  setVolume: vi.fn(async () => undefined),
} as unknown as MusicProvider;

afterEach(() => {
  usePlayerStore.setState({
    currentTrack: null,
    status: "idle",
    position: 0,
    duration: 0,
    error: null,
  });
  useQueueStore.setState({ tracks: [], currentIndex: -1, source: null });
});

describe("QueueDrawer", () => {
  it("shows every queued album track in order and marks the current track", () => {
    useQueueStore.setState({ tracks, currentIndex: 3, source: { type: "album", id: album.id } });
    usePlayerStore.setState({ currentTrack: tracks[3]!, status: "playing" });

    render(
      <MusicProviderContext.Provider value={{ provider }}>
        <QueueDrawer open onClose={vi.fn()} />
      </MusicProviderContext.Provider>,
    );

    for (const track of tracks) {
      expect(screen.getByText(track.title)).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: /Poltergeist/ }).getAttribute("aria-current")).toBe(
      "true",
    );
  });
});
