import type { Album } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";
import { Play } from "lucide-react";

export interface AlbumCardProps {
  album: Album;
  onOpen?: (album: Album) => void;
}

/**
 * Album tile. Intentionally frameless: the artwork is the focus and
 * hover is communicated through a slight scale plus a play affordance.
 */
export function AlbumCard({ album, onOpen }: AlbumCardProps) {
  const subtitle = album.artists.map((a) => a.name).join(", ");

  return (
    <button
      type="button"
      onClick={() => onOpen?.(album)}
      className="group flex w-full flex-col items-start gap-3 rounded-md p-1 text-left"
    >
      <div className="relative w-full">
        <Artwork
          src={album.artworkUrl}
          alt={album.title}
          size={220}
          seedKey={album.id}
          rounded="md"
          className="w-full transition duration-300 ease-out group-hover:scale-[1.02] group-focus-within:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-canvas)]/85 text-[var(--color-text-primary)] shadow-lg backdrop-blur">
            <Play size={16} aria-hidden="true" className="translate-x-[1px]" />
          </span>
        </div>
      </div>
      <div className="w-full min-w-0 px-1">
        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {album.title}
        </div>
        <div className="truncate text-xs text-[var(--color-text-secondary)]">{subtitle}</div>
      </div>
    </button>
  );
}
