import type { Playlist } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";
import { ListMusic } from "lucide-react";

export interface PlaylistCardProps {
  playlist: Playlist;
  onOpen?: (playlist: Playlist) => void;
}

/**
 * Playlist tile. Same frameless treatment as AlbumCard.
 */
export function PlaylistCard({ playlist, onOpen }: PlaylistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(playlist)}
      className="group flex w-full flex-col items-start gap-3 rounded-md p-1 text-left"
    >
      <div className="relative w-full">
        <Artwork
          src={playlist.artworkUrl}
          alt={playlist.name}
          size={220}
          seedKey={playlist.id}
          rounded="md"
          className="w-full transition duration-300 ease-out group-hover:scale-[1.02] group-focus-within:scale-[1.02]"
        />
        <div className="pointer-events-none absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-canvas)]/85 text-[var(--color-text-secondary)] backdrop-blur">
          <ListMusic size={14} aria-hidden="true" />
        </div>
      </div>
      <div className="w-full min-w-0 px-1">
        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {playlist.name}
        </div>
        <div className="truncate text-xs text-[var(--color-text-secondary)]">
          {playlist.description ?? `${playlist.trackCount} tracks`}
        </div>
      </div>
    </button>
  );
}
