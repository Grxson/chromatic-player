import { useCallback } from "react";
import { ArrowLeft, Disc3, Play } from "lucide-react";
import type { Album, Track } from "@/domain/entities";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { TrackRow } from "@/components/music/TrackRow";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button/Button";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useCatalogProvider } from "@/app/providers/useMusicProvider";
import { useAlbumPlayback } from "@/hooks/useAlbumPlayback";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";
import { useRouter } from "@/app/router/useRouter";
import { formatDuration } from "@/utils/time";

export interface AlbumPageProps {
  albumId: string;
}

interface AlbumData {
  album: Album;
  tracks: Track[];
  tracksError: boolean;
}

export function AlbumPage({ albumId }: AlbumPageProps) {
  const provider = useCatalogProvider();
  const albumPlayback = useAlbumPlayback();
  const playback = usePlayback();
  const { navigate } = useRouter();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);

  const loader = useCallback(() => loadAlbum(provider, albumId), [provider, albumId]);
  const { status: loadStatus, data, retry } = useAsyncResource<AlbumData>(albumId, loader);

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <>
        <Header title="Album" subtitle="Loading album…" />
        <Content>
          <div role="status" aria-label="Loading album" className="animate-pulse">
            <div className="flex flex-col gap-8 md:flex-row md:items-end">
              <div className="aspect-square w-full max-w-60 rounded-md bg-[var(--color-surface)]" />
              <div className="flex flex-1 flex-col gap-4">
                <div className="h-3 w-16 rounded bg-[var(--color-surface)]" />
                <div className="h-9 w-2/3 rounded bg-[var(--color-surface)]" />
                <div className="h-4 w-1/2 rounded bg-[var(--color-surface)]" />
              </div>
            </div>
            <div className="mt-12 space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-14 rounded-md bg-[var(--color-surface)]" />
              ))}
            </div>
          </div>
        </Content>
      </>
    );
  }

  if (loadStatus === "error" || !data) {
    return (
      <>
        <Header
          title="Album unavailable"
          actions={<BackToSearch onClick={() => navigate({ type: "view", view: "search" })} />}
        />
        <Content>
          <EmptyState
            icon={<Disc3 size={20} aria-hidden="true" />}
            title="We couldn't load this album"
            description="The album may no longer be available. Check your connection and try again."
            action={
              <Button variant="secondary" size="sm" onClick={retry}>
                Retry
              </Button>
            }
          />
        </Content>
      </>
    );
  }

  const { album, tracks, tracksError } = data;
  const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0);
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;
  const canPlayCatalog = provider.name !== "tidal-catalog";
  const isCurrentAlbum = currentTrack?.album?.id === album.id;
  const isPlayingThis = isCurrentAlbum && status === "playing";
  const artistsLine = album.artists.map((artist) => artist.name).join(", ");

  return (
    <>
      <Header
        title={album.title}
        subtitle={artistsLine}
        actions={<BackToSearch onClick={() => navigate({ type: "view", view: "search" })} />}
      />
      <Content>
        <section className="flex flex-col gap-7 md:flex-row md:items-end md:gap-8">
          <div className="relative w-full max-w-60 shrink-0">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-3xl opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, var(--chromatic-glow-primary), transparent 70%)",
              }}
            />
            <Artwork
              src={album.artworkUrl}
              alt={album.title}
              size={240}
              fluid
              seedKey={album.id}
              rounded="md"
              className="relative aspect-square object-cover shadow-xl"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Album
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
              {album.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-[var(--color-text-secondary)]">
              {album.artists.map((artist, index) => (
                <span key={artist.id} className="inline-flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">,</span> : null}
                  <button
                    type="button"
                    onClick={() => navigate({ type: "artist", id: artist.id })}
                    className="hover:text-[var(--color-text-primary)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-album-accent)]"
                  >
                    {artist.name}
                  </button>
                </span>
              ))}
              {releaseYear ? <span>· {releaseYear}</span> : null}
              <span>
                · {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
              </span>
              {totalDuration > 0 ? <span>· {formatDuration(totalDuration)}</span> : null}
            </div>
            <button
              type="button"
              onClick={() => void albumPlayback.playAlbum(album, tracks)}
              disabled={
                !canPlayCatalog || tracks.length === 0 || albumPlayback.loadingAlbumId === album.id
              }
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-album-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-canvas)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-album-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={16} aria-hidden="true" className="translate-x-px" />
              Play album
            </button>
            {isCurrentAlbum ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                {isPlayingThis ? "Now playing from this album" : "Selected from this album"}
              </p>
            ) : null}
            {provider.name === "tidal-catalog" ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                TIDAL metadata is live. TIDAL audio is unavailable in this build; local files play
                from Library.
              </p>
            ) : null}
          </div>
        </section>

        {albumPlayback.error ? (
          <p role="alert" className="mt-6 text-sm text-[var(--color-text-secondary)]">
            {albumPlayback.error}
          </p>
        ) : null}

        <section className="mt-10 pb-8" aria-label={`${album.title} tracks`}>
          {tracks.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 py-8">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {tracksError
                  ? "Couldn't load this album's tracks. Check your connection and retry."
                  : "No tracks are available for this album."}
              </p>
              {tracksError ? (
                <Button variant="secondary" size="sm" onClick={retry}>
                  Retry
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlayingThis && currentTrack?.id === track.id}
                  onOpenArtist={(artist) => navigate({ type: "artist", id: artist.id })}
                  onPlay={
                    canPlayCatalog
                      ? () => {
                          if (currentTrack?.id === track.id && isPlayingThis) {
                            void playback.togglePlay();
                          } else {
                            void albumPlayback.playAlbum(album, tracks, index);
                          }
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>
      </Content>
    </>
  );
}

function BackToSearch({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-album-accent)]"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Search
    </button>
  );
}

async function loadAlbum(
  provider: ReturnType<typeof useCatalogProvider>,
  albumId: string,
): Promise<AlbumData> {
  const album = await provider.getAlbum(albumId);
  try {
    const tracks = await provider.getAlbumTracks(albumId);
    return { album, tracks, tracksError: false };
  } catch (error) {
    console.error("Album tracks request failed", error);
    return { album, tracks: [], tracksError: true };
  }
}
