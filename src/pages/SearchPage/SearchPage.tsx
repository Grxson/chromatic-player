import { useCallback, useEffect, useRef, useState } from "react";
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
  const [searchState, setSearchState] = useState<SearchState>(INITIAL_STATE);

  // Sequence counter. Every search request bumps it; only the most
  // recent request is allowed to update the UI state. Older results are
  // ignored even if they resolve later. This prevents the classic
  // "request A finishes after B and overwrites the correct result"
  // race when the user is typing fast.
  const sequenceRef = useRef(0);

  const runSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        sequenceRef.current += 1;
        setSearchState(INITIAL_STATE);
        return;
      }

      const requestId = sequenceRef.current + 1;
      sequenceRef.current = requestId;

      setSearchState({
        phase: "loading",
        query: trimmed,
        result: null,
        error: null,
      });

      try {
        const result = await provider.search(trimmed, 10);
        // If a newer search has been initiated while we were resolving,
        // drop this result on the floor.
        if (sequenceRef.current !== requestId) {
          return;
        }
        setSearchState({
          phase: hasAnyResults(result) ? "results" : "empty",
          query: trimmed,
          result,
          error: null,
        });
      } catch (err) {
        if (sequenceRef.current !== requestId) {
          return;
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        setSearchState({
          phase: "error",
          query: trimmed,
          result: null,
          error: message,
        });
      }
    },
    [provider],
  );

  // Debounced re-run whenever the input draft changes.
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
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <label className="group flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 focus-within:border-[var(--color-text-secondary)]">
            <SearchIcon
              size={18}
              aria-hidden="true"
              className="text-[var(--color-text-muted)] group-focus-within:text-[var(--color-text-primary)]"
            />
            <input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search tracks, albums, artists…"
              aria-label="Search"
              autoFocus
              className="w-full bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
            {searchState.phase === "loading" ? <Spinner size={16} /> : null}
          </label>

          {searchState.phase === "idle" ? (
            <EmptyState
              icon={<SearchIcon size={20} aria-hidden="true" />}
              title="Search the catalogue"
              description="Type a track, album or artist name to see results from the mock data."
            />
          ) : searchState.phase === "loading" ? (
            <div className="flex justify-center py-12">
              <Spinner size={20} />
            </div>
          ) : searchState.phase === "error" ? (
            <EmptyState
              icon={<AlertCircle size={20} aria-hidden="true" />}
              title="Search failed"
              description={searchState.error ?? "Unknown error."}
            />
          ) : searchState.phase === "empty" ? (
            <EmptyState
              icon={<Music2 size={20} aria-hidden="true" />}
              title={`No results for "${searchState.query}"`}
              description="Try a different query."
            />
          ) : (
            <Results
              result={searchState.result!}
              onOpenAlbum={(album) => navigate({ type: "album", id: album.id })}
              onOpenArtist={(artist) => navigate({ type: "artist", id: artist.id })}
              // Search results are a flat discovery list, not a coherent
              // queue. Playback treats them as isolated tracks so we
              // don't fabricate context that wasn't there.
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
    <div className="space-y-10">
      {tracks.length > 0 ? (
        <section>
          <SectionHeading title="Tracks" count={tracks.length} />
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} onPlay={onPlayTrack} />
            ))}
          </div>
        </section>
      ) : null}

      {albums.length > 0 ? (
        <section>
          <SectionHeading title="Albums" count={albums.length} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} onOpen={onOpenAlbum} />
            ))}
          </div>
        </section>
      ) : null}

      {artists.length > 0 ? (
        <section>
          <SectionHeading title="Artists" count={artists.length} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} onOpen={onOpenArtist} />
            ))}
          </div>
        </section>
      ) : null}

      {playlists.length > 0 ? (
        <section>
          <SectionHeading title="Playlists" count={playlists.length} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {title}
      </h2>
      <span className="text-xs tabular-nums text-[var(--color-text-muted)]">{count}</span>
    </div>
  );
}
