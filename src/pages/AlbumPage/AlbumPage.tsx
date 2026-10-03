import { useCallback } from "react";
import { Disc3, Play, Shuffle } from "lucide-react";
import type { Album, Track } from "@/domain/entities";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { TrackRow } from "@/components/music/TrackRow";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useMusicProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";
import { formatDuration } from "@/utils/time";

export interface AlbumPageProps {
  albumId: string;
}

interface AlbumData {
  album: Album;
  tracks: Track[];
}

export function AlbumPage({ albumId }: AlbumPageProps) {
  const provider = useMusicProvider();
  const playback = usePlayback();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);

  const loader = useCallback(() => loadAlbum(provider, albumId), [provider, albumId]);
  const { status: loadStatus, data, error } = useAsyncResource<AlbumData>(albumId, loader);

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <>
        <Header title="Album" subtitle="Loading…" />
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
        <Header title="Album" />
        <Content>
          <EmptyState
            icon={<Disc3 size={20} aria-hidden="true" />}
            title="Album unavailable"
            description={error ?? "We could not load this album."}
          />
        </Content>
      </>
    );
  }

  const { album, tracks } = data;
  const artistsLine = album.artists.map((a) => a.name).join(", ");
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;
  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
  const isCurrentAlbum = currentTrack?.album?.id === album.id;
  const isPlayingThis = isCurrentAlbum && status === "playing";

  const handlePlayAlbum = () => {
    if (tracks.length === 0) {
      return;
    }
    void playback.playQueue(tracks, 0);
  };

  return (
    <>
      <Header title={album.title} subtitle={artistsLine} />
      <Content>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
          <div className="relative shrink-0">
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-3xl opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, var(--chromatic-glow-primary), transparent 70%)",
              }}
            />
            <Artwork
              src={album.artworkUrl}
              alt={album.title}
              size={240}
              seedKey={album.id}
              rounded="md"
              className="relative shadow-xl"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Album
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {album.title}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {artistsLine}
              {releaseYear ? ` · ${releaseYear}` : ""} · {tracks.length} tracks ·{" "}
              {formatDuration(totalDuration)}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePlayAlbum}
                disabled={tracks.length === 0}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-album-accent)] px-5 py-2 text-sm font-medium text-[var(--color-canvas)] hover:brightness-110 disabled:opacity-50"
              >
                <Play size={16} aria-hidden="true" className="translate-x-[1px]" />
                Play album
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-transparent px-5 py-2 text-sm text-[var(--color-text-secondary)] opacity-60"
                title="Shuffle coming soon"
              >
                <Shuffle size={14} aria-hidden="true" />
                Shuffle
              </button>
            </div>
            {isCurrentAlbum ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                {isPlayingThis ? "Now playing from this album" : "Paused on this album"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-12">
          {tracks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">No tracks in this album.</p>
          ) : (
            <div className="space-y-1">
              {tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlayingThis && currentTrack?.id === track.id}
                  onPlay={() => {
                    void playback.playQueue(tracks, index);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Content>
    </>
  );
}

async function loadAlbum(
  provider: ReturnType<typeof useMusicProvider>,
  albumId: string,
): Promise<AlbumData> {
  const [album, tracks] = await Promise.all([
    provider.getAlbum(albumId),
    provider.getAlbumTracks(albumId),
  ]);
  return { album, tracks };
}
