import { useCallback } from "react";
import { Mic2 } from "lucide-react";
import type { Album, Artist } from "@/domain/entities";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { AlbumCard } from "@/components/music/AlbumCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useMusicProvider } from "@/app/providers/useMusicProvider";
import { useRouter } from "@/app/router/useRouter";

export interface ArtistPageProps {
  artistId: string;
}

interface ArtistData {
  artist: Artist;
  albums: Album[];
}

export function ArtistPage({ artistId }: ArtistPageProps) {
  const provider = useMusicProvider();
  const { navigate } = useRouter();

  const loader = useCallback(() => loadArtist(provider, artistId), [provider, artistId]);
  const { status, data, error } = useAsyncResource<ArtistData>(artistId, loader);

  if (status === "loading" || status === "idle") {
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

  if (status === "error" || !data) {
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

  const { artist, albums } = data;

  return (
    <>
      <Header title={artist.name} subtitle="Artist" />
      <Content>
        <div className="flex flex-col gap-6 lg:flex-row">
          <Artwork src={artist.imageUrl} alt={artist.name} size={220} rounded="full" />
          <div className="flex-1">
            {albums.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                No albums for this artist yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onOpen={(a) => navigate({ type: "album", id: a.id })}
                  />
                ))}
              </div>
            )}
          </div>
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
  return { artist, albums };
}
