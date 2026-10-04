import type { Album, Artist, Playlist, Track } from "@/domain/entities";

/** Provider-neutral, aggregated catalogue search result. */
export interface SearchResult {
  query: string;
  tracks?: Track[];
  albums?: Album[];
  artists?: Artist[];
  playlists?: Playlist[];
}

/** Read-only music catalogue operations consumed by browsing surfaces. */
export interface MusicCatalogProvider {
  readonly name?: string;
  search(query: string, limit?: number): Promise<SearchResult>;
  getTrack(id: string): Promise<Track>;
  getAlbum(id: string): Promise<Album>;
  getArtist(id: string): Promise<Artist>;
  getPlaylist(id: string): Promise<Playlist>;
  getAlbumTracks(albumId: string): Promise<Track[]>;
  getArtistAlbums(artistId: string): Promise<Album[]>;
  getPlaylistTracks(playlistId: string): Promise<Track[]>;
}

/** Playback event emitted by observable backends when media state changes. */
export interface PlaybackEvent {
  type: "timeupdate" | "durationchange" | "ended" | "play" | "pause" | "error";
  position?: number;
  duration?: number;
  error?: string;
}

/** Playback backend for one track at a time; it never owns the queue. */
export interface PlaybackBackend {
  play(track: Track): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(position: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  subscribe?(listener: (event: PlaybackEvent) => void): () => void;
  stop?(): Promise<void>;
}

/** Observable authentication state. Credentials remain inside infrastructure. */
export interface AuthState {
  status?: "initializing" | "unauthenticated" | "authenticating" | "authenticated" | "error";
  /** Legacy mock-provider field retained for compatibility with v0.0.x tests. */
  isAuthenticated?: boolean;
  userId?: string;
  error?: string;
}

/** Authentication lifecycle separated from catalogue and playback. */
export interface MusicAuthProvider {
  readonly name: string;
  initialize(): Promise<AuthState>;
  login(): Promise<void>;
  handleCallback(url: string): Promise<void>;
  logout(): Promise<void>;
}

/**
 * Convenience intersection for the existing mock/test provider. Production
 * composition injects catalogue and playback independently.
 */
export type MusicProvider = MusicCatalogProvider &
  PlaybackBackend & {
    readonly name: string;
    readonly auth?: AuthState;
    authenticate?: () => Promise<void>;
    signOut?: () => Promise<void>;
  };
