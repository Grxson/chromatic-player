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
  it("falls back to included catalogue resources when search relationships are empty", async () => {
    const document = {
      data: [
        {
          type: "searchResults",
          id: "search-1",
          relationships: {
            tracks: { data: [{ type: "tracks", id: "track-1" }] },
            albums: { data: [] },
            artists: { data: [] },
            playlists: { data: [] },
          },
        },
      ],
      included: [
        {
          type: "tracks",
          id: "track-1",
          attributes: { title: "Mapped track", duration: "PT2M" },
        },
        {
          type: "albums",
          id: "album-1",
          attributes: { title: "Mapped album", numberOfItems: 10 },
        },
        { type: "artists", id: "artist-1", attributes: { name: "Mapped artist" } },
      ],
    };
    const { provider } = makeProvider({ data: document });

    await expect(provider.search("mapped")).resolves.toMatchObject({
      albums: [{ id: "album-1", title: "Mapped album" }],
      artists: [{ id: "artist-1", name: "Mapped artist" }],
    });
  });

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

  it("fills missing search album artists from the matching track album", async () => {
    const document = {
      data: [
        {
          type: "searchResults",
          id: "search-1",
          relationships: {
            tracks: { data: [{ type: "tracks", id: "track-1" }] },
            albums: { data: [] },
          },
        },
      ],
      included: [
        {
          type: "tracks",
          id: "track-1",
          attributes: { title: "Track from album", duration: "PT2M" },
          relationships: {
            artists: { data: [{ type: "artists", id: "artist-1" }] },
            albums: { data: [{ type: "albums", id: "album-1" }] },
          },
        },
        {
          type: "albums",
          id: "album-1",
          attributes: { title: "Album without direct artist relation", numberOfItems: 1 },
          relationships: { coverArt: { data: [] } },
        },
        { type: "artists", id: "artist-1", attributes: { name: "Mapped artist" } },
      ],
    };
    const { provider } = makeProvider({ data: document });

    await expect(provider.search("album")).resolves.toMatchObject({
      albums: [{ id: "album-1", artists: [{ id: "artist-1", name: "Mapped artist" }] }],
    });
  });

  it("uses the sole included search artist when an album has no track context", async () => {
    const document = {
      data: [
        {
          type: "searchResults",
          id: "search-1",
          relationships: { albums: { data: [] }, artists: { data: [] } },
        },
      ],
      included: [
        {
          type: "albums",
          id: "album-1",
          attributes: { title: "Album without track context", numberOfItems: 1 },
          relationships: { coverArt: { data: [] } },
        },
        { type: "artists", id: "artist-1", attributes: { name: "Mapped artist" } },
      ],
    };
    const { provider } = makeProvider({ data: document });

    await expect(provider.search("album")).resolves.toMatchObject({
      albums: [{ id: "album-1", artists: [{ id: "artist-1", name: "Mapped artist" }] }],
    });
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

  it("fills missing artist albums with the artist resource context", async () => {
    const document = {
      data: {
        type: "artists",
        id: "artist-1",
        attributes: { name: "Mapped artist" },
        relationships: {
          albums: { data: [{ type: "albums", id: "album-1" }] },
        },
      },
      included: [
        {
          type: "albums",
          id: "album-1",
          attributes: { title: "Artist album", numberOfItems: 1 },
          relationships: { coverArt: { data: [] } },
        },
      ],
    };
    const { provider } = makeProvider({ data: document });

    await expect(provider.getArtistAlbums("artist-1")).resolves.toMatchObject([
      { id: "album-1", artists: [{ id: "artist-1", name: "Mapped artist" }] },
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
