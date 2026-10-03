import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Music2, Search as SearchIcon } from "lucide-react";
import type { Album, Artist, Track } from "@/domain/entities";
import type { SearchResult } from "@/domain/ports";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { TrackRow } from "@/components/music/TrackRow";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { useMusicProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { useRouter } from "@/app/router/useRouter";

type Phase = "idle" | "loading" | "results" | "empty" | "error";

interface SearchState {
  phase: Phase;
  query: string;
  result: SearchResult | null;
  error: string | null;
}

const INITIAL_STATE: SearchState = {
  phase: "idle",
  query: "",
  result: null,
  error: null,
};

const DEBOUNCE_MS = 180;

function hasAnyResults(result: SearchResult | null): boolean {
  if (!result) {
    return false;
  }
  return (
    (result.tracks?.length ?? 0) +
      (result.albums?.length ?? 0) +
      (result.artists?.length ?? 0) +
      (result.playlists?.length ?? 0) >
    0
  );
}

export function SearchPage() {
  const provider = useMusicProvider();
  const playback = usePlayback();
  const { navigate } = useRouter();

  const [draft, setDraft] = useState("");
  const [state, setState] = useState<SearchState>(INITIAL_STATE);

  const runSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        setState(INITIAL_STATE);
        return;
      }
      setState({
        phase: "loading",
        query: trimmed,
        result: null,
        error: null,
      });
      try {
        const result = await provider.search(trimmed, 10);
        setState({
          phase: hasAnyResults(result) ? "results" : "empty",
          query: trimmed,
          result,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({
          phase: "error",
          query: trimmed,
          result: null,
          error: message,
        });
      }
    },
    [provider],
  );

  // Debounce-free by design at this stage. Future iterations can layer a
  // small debounce on top without changing this surface.
  useEffect(() => {
    const handle = setTimeout(() => {
      void runSearch(draft);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(handle);
    };
  }, [draft, runSearch]);

  return (
    <>
      <Header
        title="Search"
        subtitle="Find tracks, albums, artists and playlists in the mock catalogue."
      />
      <Content>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <label className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 focus-within:border-[var(--color-text-secondary)]">
            <SearchIcon size={16} aria-hidden="true" className="text-[var(--color-text-muted)]" />
            <input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search tracks, albums, artists…"
              aria-label="Search"
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
            {state.phase === "loading" ? <Spinner size={16} /> : null}
          </label>

          {state.phase === "idle" ? (
            <EmptyState
              icon={<SearchIcon size={20} aria-hidden="true" />}
              title="Search the catalogue"
              description="Type a track, album or artist name to see results from the mock data."
            />
          ) : state.phase === "loading" ? (
            <div className="flex justify-center py-12">
              <Spinner size={20} />
            </div>
          ) : state.phase === "error" ? (
            <EmptyState
              icon={<AlertCircle size={20} aria-hidden="true" />}
              title="Search failed"
              description={state.error ?? "Unknown error."}
            />
          ) : state.phase === "empty" ? (
            <EmptyState
              icon={<Music2 size={20} aria-hidden="true" />}
              title={`No results for "${state.query}"`}
              description="Try a different query."
            />
          ) : (
            <Results
              result={state.result!}
              onOpenAlbum={(album) => navigate({ type: "album", id: album.id })}
              onOpenArtist={(artist) => navigate({ type: "artist", id: artist.id })}
              onPlayTrack={(track) => {
                void playback.playTrack(track);
              }}
            />
          )}
        </div>
      </Content>
    </>
  );
}

interface ResultsProps {
  result: SearchResult;
  onOpenAlbum: (album: Album) => void;
  onOpenArtist: (artist: Artist) => void;
  onPlayTrack: (track: Track) => void;
}

function Results({ result, onOpenAlbum, onOpenArtist, onPlayTrack }: ResultsProps) {
  const tracks = result.tracks ?? [];
  const albums = result.albums ?? [];
  const artists = result.artists ?? [];
  const playlists = result.playlists ?? [];

  return (
    <div className="space-y-8">
      {tracks.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Tracks
          </h2>
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} onPlay={(t) => onPlayTrack(t)} />
            ))}
          </div>
        </section>
      ) : null}

      {albums.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Albums
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} onOpen={onOpenAlbum} />
            ))}
          </div>
        </section>
      ) : null}

      {artists.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Artists
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} onOpen={onOpenArtist} />
            ))}
          </div>
        </section>
      ) : null}

      {playlists.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Playlists
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
