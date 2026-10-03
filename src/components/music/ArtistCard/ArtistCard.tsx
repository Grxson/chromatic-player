import type { Artist } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";

export interface ArtistCardProps {
  artist: Artist;
  onOpen?: (artist: Artist) => void;
}

/**
 * Artist tile. Round artwork, soft hover. Keeps the same frameless
 * treatment as AlbumCard for visual consistency.
 */
export function ArtistCard({ artist, onOpen }: ArtistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(artist)}
      className="group flex w-full flex-col items-center gap-3 rounded-md p-1 text-center"
    >
      <Artwork
        src={artist.imageUrl}
        alt={artist.name}
        size={220}
        seedKey={`artist-${artist.id}`}
        rounded="full"
        className="w-full transition duration-300 ease-out group-hover:scale-[1.02] group-focus-within:scale-[1.02]"
      />
      <div className="w-full min-w-0 px-1">
        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {artist.name}
        </div>
        <div className="truncate text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Artist
        </div>
      </div>
    </button>
  );
}
