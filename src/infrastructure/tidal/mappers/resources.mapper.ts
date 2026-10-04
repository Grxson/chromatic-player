import type { components } from "@tidal-music/api";
import type { Album, Artist, Playlist, Track } from "@/domain/entities";

type Included = components["schemas"]["Included"];
type TidalArtist = components["schemas"]["Artists_Resource_Object"];
type TidalAlbum = components["schemas"]["Albums_Resource_Object"];
type TidalTrack = components["schemas"]["Tracks_Resource_Object"];
type TidalPlaylist = components["schemas"]["Playlists_Resource_Object"];
type TidalArtwork = components["schemas"]["Artworks_Resource_Object"];

export function parseDuration(value?: string): number {
  if (!value) return 0;
  const match = /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i.exec(value);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

function artistsFor(ids: string[], included: Included): Artist[] {
  return ids.flatMap((id) => {
    const artist = included.find(
      (item): item is TidalArtist => item.type === "artists" && item.id === id,
    );
    return artist ? [mapArtist(artist, included)] : [];
  });
}

function albumsFor(ids: string[], included: Included): Album[] {
  return ids.flatMap((id) => {
    const album = included.find(
      (item): item is TidalAlbum => item.type === "albums" && item.id === id,
    );
    return album ? [mapAlbum(album, included)] : [];
  });
}

function relationshipIds(
  data: Array<{ id: string; type: string }> | undefined,
  type: string,
): string[] {
  return data?.filter((item) => item.type === type).map((item) => String(item.id)) ?? [];
}

function artworkFor(ids: string[], included: Included): string | undefined {
  const artwork = included.find(
    (item): item is TidalArtwork => item.type === "artworks" && ids.includes(item.id),
  );
  const file = artwork?.attributes?.files.find((candidate) => candidate.meta.width >= 80);
  return file?.href;
}

export function mapArtist(resource: TidalArtist, included: Included = []): Artist {
  const profileArt = resource.relationships?.profileArt?.data;
  const artworkIds = relationshipIds(profileArt, "artworks");
  return {
    id: String(resource.id),
    name: resource.attributes?.name ?? "Unknown artist",
    imageUrl: artworkFor(artworkIds, included),
  };
}

export function mapAlbum(resource: TidalAlbum, included: Included = []): Album {
  const relationships = resource.relationships;
  const artists = artistsFor(relationshipIds(relationships?.artists?.data, "artists"), included);
  const artworkIds = relationshipIds(relationships?.coverArt?.data, "artworks");
  const attributes = resource.attributes;
  return {
    id: String(resource.id),
    title: attributes?.title ?? "Untitled album",
    artists,
    artworkUrl: artworkFor(artworkIds, included),
    releaseDate: attributes?.releaseDate,
    trackCount: attributes?.numberOfItems ?? 0,
    duration: parseDuration(attributes?.duration),
    explicit: attributes?.explicit,
  };
}

export function mapTrack(resource: TidalTrack, included: Included = []): Track {
  const relationships = resource.relationships;
  const artists = artistsFor(relationshipIds(relationships?.artists?.data, "artists"), included);
  const albums = albumsFor(relationshipIds(relationships?.albums?.data, "albums"), included);
  const album = albums[0];
  const attributes = resource.attributes;
  return {
    id: String(resource.id),
    title: attributes?.title ?? "Untitled track",
    duration: parseDuration(attributes?.duration),
    artist: artists[0] ?? album?.artists[0] ?? { id: "unknown", name: "Unknown artist" },
    ...(album ? { album } : {}),
    artworkUrl: album?.artworkUrl,
    explicit: attributes?.explicit,
  };
}

export function mapPlaylist(resource: TidalPlaylist, included: Included = []): Playlist {
  const attributes = resource.attributes;
  const artworkIds = relationshipIds(resource.relationships?.coverArt?.data, "artworks");
  return {
    id: String(resource.id),
    name: attributes?.name ?? "Untitled playlist",
    description: attributes?.description,
    artworkUrl: artworkFor(artworkIds, included),
    trackCount: attributes?.numberOfTrackItems ?? 0,
    duration: parseDuration(attributes?.duration),
  };
}

export function includedOfType<T extends Included[number]["type"]>(
  included: Included,
  type: T,
): Extract<Included[number], { type: T }>[] {
  return included.filter(
    (item): item is Extract<Included[number], { type: T }> => item.type === type,
  );
}
