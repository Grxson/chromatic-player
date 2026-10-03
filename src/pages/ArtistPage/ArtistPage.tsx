import { useCallback } from "react";
import { Mic2, Play } from "lucide-react";
import type { Album, Artist, Track } from "@/domain/entities";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { AlbumCard } from "@/components/music/AlbumCard";
import { TrackRow } from "@/components/music/TrackRow";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useMusicProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { useRouter } from "@/app/router/useRouter";
import { usePlayerStore } from "@/stores/player.store";

export interface ArtistPageProps {
  artistId: string;
}

interface ArtistData {
  artist: Artist;
  albums: Album[];
  tracks: Track[];
}

export function ArtistPage({ artistId }: ArtistPageProps) {
  const provider = useMusicProvider();
  const playback = usePlayback();
  const { navigate } = useRouter();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);

  const loader = useCallback(() => loadArtist(provider, artistId), [provider, artistId]);
  const { status: loadStatus, data, error } = useAsyncResource<ArtistData>(artistId, loader);

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <>
        <Header title="Artist" subtitle="Loading…" />
        <Content>
          <div className="flex justify-center py-24">
            <Spinner size={20} />
          </div>
        </Content>
      </>
    );
  }

  if (loadStatus === "error" || !data) {
    return (
      <>
        <Header title="Artist" />
        <Content>
          <EmptyState
            icon={<Mic2 size={20} aria-hidden="true" />}
            title="Artist unavailable"
            description={error ?? "We could not load this artist."}
          />
        </Content>
      </>
    );
  }

  const { artist, albums, tracks } = data;
  const isCurrentArtist = tracks.some((t) => t.id === currentTrack?.id);
  const isPlaying = isCurrentArtist && status === "playing";

  const handlePlayAll = () => {
    if (tracks.length === 0) {
      return;
    }
    void playback.playQueue(tracks, 0);
  };

  return (
    <>
      <Header title={artist.name} subtitle="Artist" />
      <Content>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
          <div className="relative shrink-0">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, var(--chromatic-glow-primary), transparent 70%)",
              }}
            />
            <Artwork
              src={artist.imageUrl}
              alt={artist.name}
              size={220}
              seedKey={`artist-${artist.id}`}
              rounded="full"
              className="relative shadow-xl"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Artist
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {artist.name}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {albums.length} {albums.length === 1 ? "album" : "albums"} · {tracks.length} tracks
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePlayAll}
                disabled={tracks.length === 0}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-album-accent)] px-5 py-2 text-sm font-medium text-[var(--color-canvas)] hover:brightness-110 disabled:opacity-50"
              >
                <Play size={16} aria-hidden="true" className="translate-x-[1px]" />
                Play tracks
              </button>
            </div>
            {isCurrentArtist ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                {isPlaying ? "Now playing from this artist" : "Paused on this artist"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {tracks.length > 0 ? (
            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Tracks
              </h3>
              <div className="space-y-1">
                {tracks.slice(0, 8).map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    isCurrent={currentTrack?.id === track.id}
                    isPlaying={isPlaying && currentTrack?.id === track.id}
                    onPlay={() => {
                      void playback.playQueue(tracks, index);
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {albums.length > 0 ? (
            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Albums
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onOpen={(a) => {
                      navigate({ type: "album", id: a.id });
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Content>
    </>
  );
}

async function loadArtist(
  provider: ReturnType<typeof useMusicProvider>,
  artistId: string,
): Promise<ArtistData> {
  const [artist, albums] = await Promise.all([
    provider.getArtist(artistId),
    provider.getArtistAlbums(artistId),
  ]);
  // Flatten the album tracks to give the artist page a "popular tracks"
  // surface that is meaningful even when the provider doesn't expose one.
  const trackLists = await Promise.all(albums.map((a) => provider.getAlbumTracks(a.id)));
  const tracks = trackLists.flat().slice(0, 12);
  return { artist, albums, tracks };
}
