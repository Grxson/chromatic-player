import type { Album } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";

export interface AlbumCardProps {
  album: Album;
  onOpen?: (album: Album) => void;
}

export function AlbumCard({ album, onOpen }: AlbumCardProps) {
  const subtitle = album.artists.map((a) => a.name).join(", ");

  return (
    <button
      type="button"
      onClick={() => onOpen?.(album)}
      className="group flex w-full flex-col items-start gap-3 rounded-md p-3 text-left transition-colors duration-150 hover:bg-[var(--color-surface)]"
    >
      <Artwork
        src={album.artworkUrl}
        alt={album.title}
        size={160}
        rounded="md"
        className="w-full"
      />
      <div className="w-full min-w-0">
        <div className="truncate text-sm text-[var(--color-text-primary)]">{album.title}</div>
        <div className="truncate text-xs text-[var(--color-text-secondary)]">{subtitle}</div>
      </div>
    </button>
  );
}
