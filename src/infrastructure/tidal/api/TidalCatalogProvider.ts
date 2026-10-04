import { createAPIClient, type components } from "@tidal-music/api";
import { credentialsProvider } from "@tidal-music/auth";
import type { Album, Artist, Playlist, Track } from "@/domain/entities";
import type { MusicCatalogProvider, SearchResult } from "@/domain/ports";
import {
  includedOfType,
  mapAlbum,
  mapArtist,
  mapPlaylist,
  mapTrack,
} from "../mappers/resources.mapper";

type Included = components["schemas"]["Included"];
type Client = ReturnType<typeof createAPIClient>;
type Relationship = { data?: Array<{ id: string; type: string }> };
type SearchResource = components["schemas"]["SearchResults_Resource_Object"];

// Keep this include tree within TIDAL's default ten-resource expansion limit.
const SEARCH_INCLUDE = [
  "tracks.artists",
  "tracks.albums.coverArt",
  "albums.artists",
  "albums.coverArt",
  "artists.profileArt",
  "playlists",
];

function requireData<T>(data: T | undefined, error: unknown): T {
  if (error || data === undefined) {
    throw new Error("TIDAL catalogue is unavailable. Check your connection and session.");
  }
  return data;
}

function relationIds(data: Relationship["data"], type: string): string[] {
  return data?.filter((resource) => resource.type === type).map(({ id }) => id) ?? [];
}

function relationIdsOrIncluded(
  data: Relationship["data"],
  type: Included[number]["type"],
  included: Included,
): string[] {
  if (data === undefined) return [];
  const ids = relationIds(data, type);
  return ids.length > 0 ? ids : resources(included, type).map((resource) => String(resource.id));
}

function resources<T extends Included[number]["type"]>(included: Included, type: T) {
  return includedOfType(included, type);
}

function orderedResources<T extends Included[number]["type"]>(
  included: Included,
  type: T,
  ids: string[],
): Extract<Included[number], { type: T }>[] {
  const candidates = resources(included, type);
  return ids.flatMap((id) => {
    const match = candidates.find((resource) => resource.id === id);
    return match ? [match] : [];
  });
}

/** Read-only adapter over the official TIDAL OpenAPI v2 SDK client. */
export class TidalCatalogProvider implements MusicCatalogProvider {
  readonly name = "tidal-catalog";

  constructor(private readonly client: Client = createAPIClient(credentialsProvider)) {}

  async search(query: string, limit = 10): Promise<SearchResult> {
    const normalized = query.trim();
    if (!normalized) return { query, tracks: [], albums: [], artists: [], playlists: [] };

    const { data, error } = await this.client.GET("/searchResults", {
      params: {
        query: {
          "filter[query]": normalized,
          deviceType: "DESKTOP",
          systemType: "DESKTOP",
          include: SEARCH_INCLUDE,
        },
      },
    });
    const document = requireData(data, error);
    const search = document.data[0] as SearchResource | undefined;
    const included = (document.included ?? []) as Included;
    const relationships = search?.relationships;

    const trackIds = relationIds(relationships?.tracks?.data, "tracks");
    const albumIds = relationIdsOrIncluded(relationships?.albums?.data, "albums", included);
    const artistIds = relationIdsOrIncluded(relationships?.artists?.data, "artists", included);
    const playlistIds = relationIdsOrIncluded(
      relationships?.playlists?.data,
      "playlists",
      included,
    );

    return {
      query,
      tracks: orderedResources(included, "tracks", trackIds)
        .slice(0, limit)
        .map((item) => mapTrack(item, included)),
      albums: orderedResources(included, "albums", albumIds)
        .slice(0, limit)
        .map((item) => mapAlbum(item, included)),
      artists: orderedResources(included, "artists", artistIds)
        .slice(0, limit)
        .map((item) => mapArtist(item, included)),
      playlists: orderedResources(included, "playlists", playlistIds)
        .slice(0, limit)
        .map((item) => mapPlaylist(item, included)),
    };
  }

  async getTrack(id: string): Promise<Track> {
    const { data, error } = await this.client.GET("/tracks/{id}", {
      params: { path: { id }, query: { include: ["artists", "albums.coverArt"] } },
    });
    const document = requireData(data, error);
    return mapTrack(document.data, (document.included ?? []) as Included);
  }

  async getAlbum(id: string): Promise<Album> {
    const { data, error } = await this.client.GET("/albums/{id}", {
      params: {
        path: { id },
        query: { include: ["artists", "coverArt", "items.artists", "items.albums.coverArt"] },
      },
    });
    const document = requireData(data, error);
    return mapAlbum(document.data, (document.included ?? []) as Included);
  }

  async getArtist(id: string): Promise<Artist> {
    const { data, error } = await this.client.GET("/artists/{id}", {
      params: { path: { id }, query: { include: ["profileArt"] } },
    });
    const document = requireData(data, error);
    return mapArtist(document.data, (document.included ?? []) as Included);
  }

  async getPlaylist(id: string): Promise<Playlist> {
    const { data, error } = await this.client.GET("/playlists/{id}", {
      params: {
        path: { id },
        query: { include: ["coverArt", "items.artists", "items.albums.coverArt"] },
      },
    });
    const document = requireData(data, error);
    return mapPlaylist(document.data, (document.included ?? []) as Included);
  }

  async getAlbumTracks(albumId: string): Promise<Track[]> {
    const { data, error } = await this.client.GET("/albums/{id}", {
      params: {
        path: { id: albumId },
        query: { include: ["artists", "coverArt", "items.artists", "items.albums.coverArt"] },
      },
    });
    const document = requireData(data, error);
    const included = (document.included ?? []) as Included;
    const trackIds = relationIds(document.data.relationships?.items?.data, "tracks");
    return orderedResources(included, "tracks", trackIds).map((item) => mapTrack(item, included));
  }

  async getArtistAlbums(artistId: string): Promise<Album[]> {
    const { data, error } = await this.client.GET("/artists/{id}", {
      params: {
        path: { id: artistId },
        query: { include: ["albums.artists", "albums.coverArt", "profileArt"] },
      },
    });
    const document = requireData(data, error);
    const included = (document.included ?? []) as Included;
    const albumIds = relationIds(document.data.relationships?.albums?.data, "albums");
    return orderedResources(included, "albums", albumIds).map((item) => mapAlbum(item, included));
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    const { data, error } = await this.client.GET("/playlists/{id}", {
      params: {
        path: { id: playlistId },
        query: { include: ["items.artists", "items.albums.coverArt"] },
      },
    });
    const document = requireData(data, error);
    const included = (document.included ?? []) as Included;
    const trackIds = relationIds(document.data.relationships?.items?.data, "tracks");
    return orderedResources(included, "tracks", trackIds).map((item) => mapTrack(item, included));
  }
}
