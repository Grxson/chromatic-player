import { Heart } from "lucide-react";
import type { Track } from "@/domain/entities";
import { useLibraryStore } from "@/stores";
import { Artwork } from "@/components/music/Artwork";
import { IconButton } from "@/components/common/IconButton";
import { formatDuration } from "@/utils/time";

export interface TrackRowProps {
  track: Track;
  index?: number;
  onPlay?: (track: Track) => void;
}

export function TrackRow({ track, index, onPlay }: TrackRowProps) {
  const liked = useLibraryStore((state) => state.likedTrackIds.includes(track.id));
  const toggleLike = useLibraryStore((state) => state.toggleLikeTrack);

  return (
    <div
      role="row"
      className="group grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--color-surface)]"
    >
      <div className="w-8 text-center text-xs text-[var(--color-text-muted)]">
        {typeof index === "number" ? <span className="group-hover:hidden">{index + 1}</span> : null}
        {onPlay ? (
          <button
            type="button"
            onClick={() => onPlay(track)}
            className="hidden h-6 w-6 items-center justify-center text-[var(--color-text-primary)] group-hover:inline-flex"
            aria-label={`Play ${track.title}`}
          >
            ▶
          </button>
        ) : null}
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <Artwork src={track.artworkUrl} alt={track.album?.title ?? track.title} size={40} />
        <div className="min-w-0">
          <div className="truncate text-sm text-[var(--color-text-primary)]">{track.title}</div>
          <div className="truncate text-xs text-[var(--color-text-secondary)]">
            {track.artist.name}
          </div>
        </div>
      </div>

      <div className="hidden truncate text-xs text-[var(--color-text-secondary)] md:block">
        {track.album?.title ?? "—"}
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          label={liked ? "Unlike" : "Like"}
          size="sm"
          tone="subtle"
          aria-pressed={liked}
          onClick={() => toggleLike(track.id)}
        >
          <Heart
            size={14}
            fill={liked ? "currentColor" : "none"}
            className={liked ? "text-[var(--color-accent)]" : ""}
            aria-hidden="true"
          />
        </IconButton>
        <span className="w-10 text-right text-xs tabular-nums text-[var(--color-text-muted)]">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
