import { Disc3 } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { TrackRow } from "@/components/music/TrackRow";
import { mockAlbums, mockTracks } from "@/mocks";

/**
 * Placeholder album detail page. The selected album id will be supplied
 * by the router in a later milestone; for now we render the first mock
 * album so the visual layout is verifiable.
 */
export function AlbumPage() {
  const album = mockAlbums[0];
  const tracks = album ? mockTracks.filter((track) => track.album?.id === album.id) : [];

  if (!album) {
    return (
      <>
        <Header title="Album" />
        <Content>
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
              <Disc3 size={20} aria-hidden="true" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">No album selected.</p>
          </div>
        </Content>
      </>
    );
  }

  return (
    <>
      <Header title={album.title} subtitle={album.artists.map((a) => a.name).join(", ")} />
      <Content>
        <div className="flex flex-col gap-6 lg:flex-row">
          <Artwork src={album.artworkUrl} alt={album.title} size={220} rounded="md" />
          <div className="flex-1 space-y-1">
            {tracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} />
            ))}
          </div>
        </div>
      </Content>
    </>
  );
}
