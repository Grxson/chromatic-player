import { useCallback } from "react";
import { Disc3 } from "lucide-react";
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

  const loader = useCallback(() => loadAlbum(provider, albumId), [provider, albumId]);
  const { status, data, error } = useAsyncResource<AlbumData>(albumId, loader);

  if (status === "loading" || status === "idle") {
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

  if (status === "error" || !data) {
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
  const subtitle = album.artists.map((a) => a.name).join(", ");

  const handlePlayAll = () => {
    void playback.playTracks(tracks);
  };

  return (
    <>
      <Header
        title={album.title}
        subtitle={subtitle}
        actions={
          <button
            type="button"
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-canvas)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            Play album
          </button>
        }
      />
      <Content>
        <div className="flex flex-col gap-6 lg:flex-row">
          <Artwork src={album.artworkUrl} alt={album.title} size={220} rounded="md" />
          <div className="flex-1 space-y-1">
            {tracks.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">No tracks in this album.</p>
            ) : (
              tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  onPlay={(t) => {
                    void playback.playTrack(t);
                  }}
                />
              ))
            )}
          </div>
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
