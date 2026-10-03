import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { TrackRow } from "@/components/music/TrackRow";
import { mockAlbums, mockArtists, mockPlaylists, mockTracks } from "@/mocks";

export function HomePage() {
  return (
    <>
      <Header title="Home" subtitle="A quiet starting point — your library will live here." />
      <Content>
        <div className="space-y-10">
          <Section title="Recently played">
            <div className="space-y-1">
              {mockTracks.slice(0, 5).map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} />
              ))}
            </div>
          </Section>

          <Section title="Albums">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {mockAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </Section>

          <Section title="Artists">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {mockArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </Section>

          <Section title="Playlists">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {mockPlaylists.map((playlist) => (
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
