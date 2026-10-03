import type { Album, Artist, Playlist, Track } from "@/domain/entities";
import type { SearchResult } from "@/domain/ports";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { TrackRow } from "@/components/music/TrackRow";
import { Spinner } from "@/components/common/Spinner";
import { useMusicProvider } from "@/app/providers/useMusicProvider";
import { usePlayback } from "@/hooks/usePlayback";
import { useRouter } from "@/app/router/useRouter";
import { useAsyncResource } from "@/hooks/useAsyncResource";

interface HomeData {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export function HomePage() {
  const provider = useMusicProvider();
  const playback = usePlayback();
  const { navigate } = useRouter();

  // Empty query is interpreted by the mock provider as "browse the
  // catalogue". A real backend will swap this for a proper home-feed
  // endpoint without changing the rest of the UI.
  const { status, data } = useAsyncResource<HomeData>("home", () =>
    provider.search("", 10).then((result: SearchResult) => ({
      tracks: result.tracks ?? [],
      albums: result.albums ?? [],
      artists: result.artists ?? [],
      playlists: result.playlists ?? [],
    })),
  );

  const loading = status === "loading" || status === "idle";
  const tracks = data?.tracks ?? [];
  const albums = data?.albums ?? [];
  const artists = data?.artists ?? [];
  const playlists = data?.playlists ?? [];

  return (
    <>
      <Header title="Home" subtitle="A quiet starting point — your library will live here." />
      <Content>
        <div className="space-y-10">
          <Section title="Recently played">
            {loading && tracks.length === 0 ? (
              <div className="flex justify-center py-8">
                <Spinner size={18} />
              </div>
            ) : (
              <div className="space-y-1">
                {tracks.slice(0, 5).map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    onPlay={(t) => {
                      void playback.playTrack(t);
                    }}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Albums">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onOpen={(a) => navigate({ type: "album", id: a.id })}
                />
              ))}
            </div>
          </Section>

          <Section title="Artists">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {artists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onOpen={(a) => navigate({ type: "artist", id: a.id })}
                />
              ))}
            </div>
          </Section>

          <Section title="Playlists">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </Section>
        </div>
      </Content>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
