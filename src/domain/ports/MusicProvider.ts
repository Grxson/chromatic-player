import type { Album, Artist, Playlist, Track } from "@/domain/entities";

/**
 * Aggregated search response. Every list is optional because not every
 * provider supports every category, and not every query returns results
 * for every section.
 */
export interface SearchResult {
  query: string;
  tracks?: Track[];
  albums?: Album[];
  artists?: Artist[];
  playlists?: Playlist[];
}

/**
 * Authentication status reported by a provider.
 */
export interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
}

/**
 * MusicProvider is the only contract the application uses to talk to any
 * music backend. The UI layer must never depend on a concrete provider
 * implementation directly — it must depend on this interface.
 *
 * Concrete implementations live under `src/infrastructure/*` (e.g.
 * TidalProvider, MockMusicProvider). Future providers such as Jellyfin or
 * local files will implement the same port without requiring UI changes.
 *
 * Scope:
 * - The provider knows how to talk to a music service and reproduce a
 *   single track at a time.
 * - The provider does NOT own the queue or queue navigation
 *   (`next` / `previous`). Queue ownership lives in the application
 *   (`QueueStore` + `usePlayback`) so the UI keeps a single source of
 *   truth regardless of which backend is active.
 */
export interface MusicProvider {
  readonly name: string;
  readonly auth: AuthState;

  authenticate(): Promise<void>;
  signOut(): Promise<void>;

  search(query: string, limit?: number): Promise<SearchResult>;

  getTrack(id: string): Promise<Track>;
  getAlbum(id: string): Promise<Album>;
  getArtist(id: string): Promise<Artist>;
  getPlaylist(id: string): Promise<Playlist>;

  getAlbumTracks(albumId: string): Promise<Track[]>;
  getArtistAlbums(artistId: string): Promise<Album[]>;
  getPlaylistTracks(playlistId: string): Promise<Track[]>;

  play(track: Track): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(position: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
}
