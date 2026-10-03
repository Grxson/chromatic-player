import { Mic2 } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { AlbumCard } from "@/components/music/AlbumCard";
import { mockAlbums, mockArtists } from "@/mocks";

/**
 * Placeholder artist detail page. The real routing story arrives with
 * the Core Player release; we render the first mock artist so the layout
 * can be verified visually.
 */
export function ArtistPage() {
  const artist = mockArtists[0];
  const albums = artist
    ? mockAlbums.filter((album) => album.artists.some((a) => a.id === artist.id))
    : [];

  if (!artist) {
    return (
      <>
        <Header title="Artist" />
        <Content>
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
              <Mic2 size={20} aria-hidden="true" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">No artist selected.</p>
          </div>
        </Content>
      </>
    );
  }

  return (
    <>
      <Header title={artist.name} subtitle="Artist" />
      <Content>
        <div className="flex flex-col gap-6 lg:flex-row">
          <Artwork src={artist.imageUrl} alt={artist.name} size={220} rounded="full" />
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        </div>
      </Content>
    </>
  );
}
