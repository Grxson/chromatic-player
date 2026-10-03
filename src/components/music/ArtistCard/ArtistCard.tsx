import type { Artist } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";

export interface ArtistCardProps {
  artist: Artist;
  onOpen?: (artist: Artist) => void;
}

export function ArtistCard({ artist, onOpen }: ArtistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(artist)}
      className="group flex w-full flex-col items-center gap-3 rounded-md p-3 text-center transition-colors duration-150 hover:bg-[var(--color-surface)]"
    >
      <Artwork
        src={artist.imageUrl}
        alt={artist.name}
        size={160}
        rounded="full"
        className="w-full"
      />
      <div className="w-full min-w-0">
        <div className="truncate text-sm text-[var(--color-text-primary)]">{artist.name}</div>
        <div className="truncate text-xs text-[var(--color-text-secondary)]">Artist</div>
      </div>
    </button>
  );
}
