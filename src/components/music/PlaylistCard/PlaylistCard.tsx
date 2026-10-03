import type { Playlist } from "@/domain/entities";
import { Artwork } from "@/components/music/Artwork";

export interface PlaylistCardProps {
  playlist: Playlist;
  onOpen?: (playlist: Playlist) => void;
}

export function PlaylistCard({ playlist, onOpen }: PlaylistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(playlist)}
      className="group flex w-full flex-col items-start gap-3 rounded-md p-3 text-left transition-colors duration-150 hover:bg-[var(--color-surface)]"
    >
      <Artwork
        src={playlist.artworkUrl}
        alt={playlist.name}
        size={160}
        rounded="md"
        className="w-full"
      />
      <div className="w-full min-w-0">
        <div className="truncate text-sm text-[var(--color-text-primary)]">{playlist.name}</div>
        <div className="truncate text-xs text-[var(--color-text-secondary)]">
          Playlist · {playlist.trackCount} tracks
        </div>
      </div>
    </button>
  );
}
