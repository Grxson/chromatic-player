import { describe, expect, it, vi } from "vitest";
import type { createAPIClient } from "@tidal-music/api";
import { TidalCatalogProvider } from "@/infrastructure/tidal/api/TidalCatalogProvider";

type Client = ReturnType<typeof createAPIClient>;

function makeProvider(response: unknown) {
  const get = vi.fn().mockResolvedValue(response);
  const client = { GET: get } as unknown as Client;
  return { provider: new TidalCatalogProvider(client), get };
}

describe("TidalCatalogProvider", () => {
  it("maps search result resources to provider-neutral entities", async () => {
    const document = {
      data: [
        {
          type: "searchResults",
          id: "search-1",
          relationships: {
            tracks: { data: [{ type: "tracks", id: "track-1" }] },
          },
        },
      ],
      included: [
        {
          type: "tracks",
          id: "track-1",
          attributes: { title: "Mapped track", duration: "PT2M" },
          relationships: { artists: { data: [{ type: "artists", id: "artist-1" }] } },
        },
        { type: "artists", id: "artist-1", attributes: { name: "Mapped artist" } },
      ],
    };
    const { provider, get } = makeProvider({ data: document });

    await expect(provider.search("  mapped  ")).resolves.toMatchObject({
      query: "  mapped  ",
      tracks: [
        {
          id: "track-1",
          title: "Mapped track",
          duration: 120,
          artist: { id: "artist-1", name: "Mapped artist" },
        },
      ],
      albums: [],
      artists: [],
      playlists: [],
    });
    expect(get).toHaveBeenCalledWith(
      "/searchResults",
      expect.objectContaining({
        params: expect.objectContaining({
          query: expect.objectContaining({
            "filter[query]": "mapped",
            include: [
              "tracks.artists",
              "tracks.albums.coverArt",
              "albums.artists",
              "albums.coverArt",
              "artists.profileArt",
              "playlists",
            ],
          }),
        }),
      }),
    );
  });

  it("returns album tracks in the API relationship order", async () => {
    const document = {
      data: {
        type: "albums",
        id: "album-1",
        relationships: {
          items: {
            data: [
              { type: "tracks", id: "track-2" },
              { type: "tracks", id: "track-1" },
            ],
          },
        },
      },
      included: [
        { type: "tracks", id: "track-1", attributes: { title: "One", duration: "PT1S" } },
        { type: "tracks", id: "track-2", attributes: { title: "Two", duration: "PT2S" } },
      ],
    };
    const { provider } = makeProvider({ data: document });

    await expect(provider.getAlbumTracks("album-1")).resolves.toMatchObject([
      { id: "track-2", title: "Two" },
      { id: "track-1", title: "One" },
    ]);
  });

  it("returns playlist tracks in the API relationship order", async () => {
    const document = {
      data: {
        type: "playlists",
        id: "playlist-1",
        relationships: {
          items: {
            data: [
              { type: "tracks", id: "track-2" },
              { type: "tracks", id: "track-1" },
            ],
          },
        },
      },
      included: [
        { type: "tracks", id: "track-1", attributes: { title: "One", duration: "PT1S" } },
        { type: "tracks", id: "track-2", attributes: { title: "Two", duration: "PT2S" } },
      ],
    };
    const { provider } = makeProvider({ data: document });

    await expect(provider.getPlaylistTracks("playlist-1")).resolves.toMatchObject([
      { id: "track-2", title: "Two" },
      { id: "track-1", title: "One" },
    ]);
  });

  it("returns empty results for blank search and maps API failures safely", async () => {
    const blank = makeProvider({});
    await expect(blank.provider.search(" ")).resolves.toEqual({
      query: " ",
      tracks: [],
      albums: [],
      artists: [],
      playlists: [],
    });
    expect(blank.get).not.toHaveBeenCalled();

    const failing = makeProvider({ data: undefined, error: new Error("unauthorized") });
    await expect(failing.provider.getAlbum("album-1")).rejects.toThrow(
      "TIDAL catalogue is unavailable",
    );
  });
});
