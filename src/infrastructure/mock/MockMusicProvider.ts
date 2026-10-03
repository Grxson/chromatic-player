import type { Album, Artist, Playlist, Track } from "@/domain/entities";
import type { AuthState, MusicProvider, SearchResult } from "@/domain/ports";
import { mockAlbums, mockArtists, mockPlaylists, mockTracks } from "@/mocks";

/**
 * Deterministic delay used to simulate network latency without making
 * the UI feel unresponsive during development.
 */
const SIMULATED_DELAY_MS = 120;

/**
 * Internal state of the mock provider. Exposed via {@link snapshot}
 * for the upcoming debugging surface.
 */
interface MockPlaybackSnapshot {
  isPlaying: boolean;
  position: number;
  volume: number;
}

/**
 * In-memory music provider used during the foundation phase. It implements
 * the full MusicProvider contract against a tiny static dataset so the UI
 * and stores can be exercised end-to-end without any backend.
 *
 * It does not produce audio. Playback calls only mutate the provider's
 * internal state; a real audio engine will replace this behaviour in a
 * later milestone.
 */
export class MockMusicProvider implements MusicProvider {
  readonly name = "mock";

  #auth: AuthState = { isAuthenticated: true };

  #nowPlaying: Track | null = null;
  #isPlaying = false;
  #position = 0;
  #volume = 0.8;

  get auth(): AuthState {
    return this.#auth;
  }

  /** Snapshot of the mock playback state. Useful for diagnostics. */
  snapshot(): MockPlaybackSnapshot {
    return {
      isPlaying: this.#isPlaying,
      position: this.#position,
      volume: this.#volume,
    };
  }

  async authenticate(): Promise<void> {
    await this.#wait();
    this.#auth = { isAuthenticated: true, userId: "mock-user" };
  }

  async signOut(): Promise<void> {
    await this.#wait();
    this.#auth = { isAuthenticated: false };
    this.#nowPlaying = null;
    this.#isPlaying = false;
    this.#position = 0;
  }

  async search(query: string, limit = 10): Promise<SearchResult> {
    await this.#wait();
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      return { query };
    }

    const tracks = mockTracks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, limit);

    const albums = mockAlbums.filter((a) => a.title.toLowerCase().includes(q)).slice(0, limit);

    const artists = mockArtists.filter((a) => a.name.toLowerCase().includes(q)).slice(0, limit);

    return { query, tracks, albums, artists };
  }

  async getTrack(id: string): Promise<Track> {
    await this.#wait();
    const track = mockTracks.find((t) => t.id === id);
    if (!track) {
      throw new Error(`MockMusicProvider: track "${id}" not found`);
    }
    return track;
  }

  async getAlbum(id: string): Promise<Album> {
    await this.#wait();
    const album = mockAlbums.find((a) => a.id === id);
    if (!album) {
      throw new Error(`MockMusicProvider: album "${id}" not found`);
    }
    return album;
  }

  async getArtist(id: string): Promise<Artist> {
    await this.#wait();
    const artist = mockArtists.find((a) => a.id === id);
    if (!artist) {
      throw new Error(`MockMusicProvider: artist "${id}" not found`);
    }
    return artist;
  }

  async getPlaylist(id: string): Promise<Playlist> {
    await this.#wait();
    const playlist = mockPlaylists.find((p) => p.id === id);
    if (!playlist) {
      throw new Error(`MockMusicProvider: playlist "${id}" not found`);
    }
    return playlist;
  }

  async getAlbumTracks(albumId: string): Promise<Track[]> {
    await this.#wait();
    return mockTracks.filter((t) => t.album?.id === albumId);
  }

  async getArtistAlbums(artistId: string): Promise<Album[]> {
    await this.#wait();
    return mockAlbums.filter((a) => a.artists.some((ar) => ar.id === artistId));
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    await this.#wait();
    const playlist = mockPlaylists.find((p) => p.id === playlistId);
    return playlist?.tracks ?? [];
  }

  async play(track: Track): Promise<void> {
    await this.#wait();
    this.#nowPlaying = track;
    this.#isPlaying = true;
    this.#position = 0;
  }

  async pause(): Promise<void> {
    await this.#wait();
    this.#isPlaying = false;
  }

  async resume(): Promise<void> {
    await this.#wait();
    if (this.#nowPlaying) {
      this.#isPlaying = true;
    }
  }

  async next(): Promise<void> {
    await this.#wait();
    // The mock has no real queue; the player store handles sequencing.
    this.snapshot();
  }

  async previous(): Promise<void> {
    await this.#wait();
    // The mock has no real queue; the player store handles sequencing.
    this.snapshot();
  }

  async seek(position: number): Promise<void> {
    await this.#wait();
    this.#position = Math.max(0, position);
  }

  async setVolume(volume: number): Promise<void> {
    await this.#wait();
    this.#volume = Math.min(1, Math.max(0, volume));
  }

  async #wait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  }
}
