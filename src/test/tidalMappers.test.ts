import { describe, expect, it } from "vitest";
import type { components } from "@tidal-music/api";
import {
  mapAlbum,
  mapArtist,
  mapPlaylist,
  mapTrack,
  parseDuration,
} from "@/infrastructure/tidal/mappers/resources.mapper";

type Included = components["schemas"]["Included"];

function resource(type: string, id: string, attributes: object, relationships?: object) {
  return { type, id, attributes, ...(relationships ? { relationships } : {}) };
}

const artist = resource("artists", "artist-1", { name: "Artist" });
const artwork = resource("artworks", "art-1", {
  files: [{ href: "https://images.example/art.jpg", meta: { width: 640, height: 640 } }],
});
const album = resource(
  "albums",
  "album-1",
  {
    title: "Album",
    numberOfItems: 1,
    duration: "PT3M20S",
    releaseDate: "2024-01-01",
    explicit: false,
  },
  {
    artists: { data: [{ id: "artist-1", type: "artists" }] },
    coverArt: { data: [{ id: "art-1", type: "artworks" }] },
  },
);
const included = [artist, artwork, album] as unknown as Included;

describe("TIDAL resource mappers", () => {
  it("maps album relationships, artwork, IDs and duration into domain values", () => {
    expect(mapAlbum(album as never, included)).toEqual({
      id: "album-1",
      title: "Album",
      artists: [{ id: "artist-1", name: "Artist" }],
      artworkUrl: "https://images.example/art.jpg",
      releaseDate: "2024-01-01",
      trackCount: 1,
      duration: 200,
      explicit: false,
    });
  });

  it("maps track metadata and uses safe fallbacks for missing relationships", () => {
    const track = resource(
      "tracks",
      "track-1",
      { title: "Track", duration: "PT1M", explicit: true },
      {
        artists: { data: [{ id: "artist-1", type: "artists" }] },
        albums: { data: [{ id: "album-1", type: "albums" }] },
      },
    );
    expect(mapTrack(track as never, included)).toMatchObject({
      id: "track-1",
      title: "Track",
      duration: 60,
      artist: { id: "artist-1", name: "Artist" },
      album: { id: "album-1", title: "Album" },
      artworkUrl: "https://images.example/art.jpg",
      explicit: true,
    });

    const sparse = mapTrack(resource("tracks", "track-2", {}) as never);
    expect(sparse).toMatchObject({
      id: "track-2",
      title: "Untitled track",
      duration: 0,
      artist: { id: "unknown", name: "Unknown artist" },
    });
  });

  it("preserves relationship order for track artists and album relationships", () => {
    const artistA = resource("artists", "artist-a", { name: "Artist A" });
    const artistB = resource("artists", "artist-b", { name: "Artist B" });
    const albumA = resource("albums", "album-a", { title: "Album A" });
    const albumB = resource("albums", "album-b", { title: "Album B" });
    const track = resource(
      "tracks",
      "track-ordered",
      { title: "Ordered track" },
      {
        artists: {
          data: [
            { id: "artist-b", type: "artists" },
            { id: "artist-a", type: "artists" },
          ],
        },
        albums: {
          data: [
            { id: "album-b", type: "albums" },
            { id: "album-a", type: "albums" },
          ],
        },
      },
    );

    expect(
      mapTrack(track as never, [albumA, artistA, albumB, artistB] as unknown as Included),
    ).toMatchObject({
      artist: { id: "artist-b", name: "Artist B" },
      album: { id: "album-b", title: "Album B" },
    });

    const collection = resource(
      "albums",
      "album-collection",
      { title: "Collection" },
      {
        artists: {
          data: [
            { id: "artist-b", type: "artists" },
            { id: "artist-a", type: "artists" },
          ],
        },
      },
    );
    expect(
      mapAlbum(collection as never, [artistA, artistB] as unknown as Included).artists,
    ).toEqual([
      { id: "artist-b", name: "Artist B" },
      { id: "artist-a", name: "Artist A" },
    ]);
  });

  it("maps artists and playlists without requiring artwork", () => {
    expect(mapArtist(artist as never)).toEqual({ id: "artist-1", name: "Artist" });
    const playlist = resource("playlists", "playlist-1", {
      name: "Mix",
      description: "A mix",
      numberOfTrackItems: 2,
      duration: "PT5S",
    });
    expect(mapPlaylist(playlist as never)).toEqual({
      id: "playlist-1",
      name: "Mix",
      description: "A mix",
      artworkUrl: undefined,
      trackCount: 2,
      duration: 5,
    });
  });

  it("parses ISO durations and safely returns zero for unsupported values", () => {
    expect(parseDuration("PT1H2M3.5S")).toBe(3723.5);
    expect(parseDuration("not-a-duration")).toBe(0);
    expect(parseDuration()).toBe(0);
  });
});
