import { useCallback } from "react";
import { ListMusic, Play } from "lucide-react";
import type { Playlist, Track } from "@/domain/entities";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { TrackRow } from "@/components/music/TrackRow";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useCatalogProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";

interface PlaylistData {
  playlist: Playlist;
  tracks: Track[];
}

export function PlaylistPage({ playlistId }: { playlistId: string }) {
  const provider = useCatalogProvider();
  const playback = usePlayback();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);
  const loader = useCallback(async (): Promise<PlaylistData> => {
    const [playlist, tracks] = await Promise.all([
      provider.getPlaylist(playlistId),
      provider.getPlaylistTracks(playlistId),
    ]);
    return { playlist, tracks };
  }, [provider, playlistId]);
  const { status: loadStatus, data, error } = useAsyncResource<PlaylistData>(playlistId, loader);

  if (loadStatus === "idle" || loadStatus === "loading") {
    return (
      <>
        <Header title="Playlist" subtitle="Loading…" />
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
        <Header title="Playlist" />
        <Content>
          <EmptyState
            icon={<ListMusic size={20} />}
            title="Playlist unavailable"
            description={error ?? "We could not load this playlist."}
          />
        </Content>
      </>
    );
  }

  return (
    <>
      <Header title={data.playlist.name} subtitle="Playlist" />
      <Content>
        <section className="flex flex-col gap-7 sm:flex-row sm:items-end">
          <Artwork
            src={data.playlist.artworkUrl}
            alt={data.playlist.name}
            size={220}
            seedKey={data.playlist.id}
            rounded="md"
            className="shadow-xl"
          />
          <div className="min-w-0 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              Playlist
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {data.playlist.name}
            </h2>
            {data.playlist.description ? (
              <p className="max-w-2xl text-sm text-[var(--color-text-secondary)]">
                {data.playlist.description}
              </p>
            ) : null}
            <p className="text-sm text-[var(--color-text-muted)]">{data.tracks.length} tracks</p>
            <button
              type="button"
              disabled={data.tracks.length === 0}
              onClick={() => void playback.playQueue(data.tracks, 0)}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-album-accent)] px-5 py-2 text-sm font-medium text-[var(--color-canvas)] disabled:opacity-50"
            >
              <Play size={16} aria-hidden="true" /> Play playlist
            </button>
          </div>
        </section>
        <div className="mt-10 space-y-1">
          {data.tracks.map((track, index) => (
            <TrackRow
              key={`${index}-${track.id}`}
              track={track}
              index={index}
              isCurrent={currentTrack?.id === track.id}
              isPlaying={status === "playing" && currentTrack?.id === track.id}
              onPlay={() => void playback.playQueue(data.tracks, index)}
            />
          ))}
        </div>
      </Content>
    </>
  );
}
