import { Fragment, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ListMusic, Trash2, X } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";
import { Artwork } from "@/components/music/Artwork";
import { usePlayerStore } from "@/stores/player.store";
import { useQueueStore } from "@/stores/queue.store";
import { usePlayback } from "@/hooks/usePlayback";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { cn } from "@/utils/cn";

export interface QueueDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Called when the drawer closes after being opened via an explicit trigger. */
  onClosed?: () => void;
}

/**
 * Variant sets for the motion components. With animations disabled we
 * still need to provide every prop because Motion expects a defined
 * `initial` / `animate` pair; `false` makes the component skip the
 * initial render entirely.
 */
const BACKDROP_MOTION = {
  withMotion: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
  },
  noMotion: {
    initial: false,
    animate: undefined,
    exit: undefined,
    transition: undefined,
  },
};

const PANEL_MOTION = {
  withMotion: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
  },
  noMotion: {
    initial: false,
    animate: undefined,
    exit: undefined,
    transition: undefined,
  },
};

export function QueueDrawer({ open, onClose, onClosed }: QueueDrawerProps) {
  const tracks = useQueueStore((state) => state.tracks);
  const currentIndex = useQueueStore((state) => state.currentIndex);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);
  const playback = usePlayback();
  const { motionEnabled } = useMotionPreference();
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the container when it opens so screen readers announce it.
  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      onClosed?.();
    }
  }, [open, onClosed]);

  const hasNext = currentIndex >= 0 && currentIndex < tracks.length - 1;

  const backdrop = motionEnabled ? BACKDROP_MOTION.withMotion : BACKDROP_MOTION.noMotion;
  const panel = motionEnabled ? PANEL_MOTION.withMotion : PANEL_MOTION.noMotion;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="queue-backdrop"
            className="fixed inset-0 z-40 bg-[var(--color-canvas)]/60 backdrop-blur-sm"
            initial={backdrop.initial}
            animate={backdrop.animate}
            exit={backdrop.exit}
            transition={backdrop.transition}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="queue-panel"
            ref={containerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Queue"
            initial={panel.initial}
            animate={panel.animate}
            exit={panel.exit}
            transition={panel.transition}
            className="fixed right-0 top-0 z-50 flex h-full w-[360px] max-w-[92vw] flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xl focus:outline-none"
          >
            <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                <ListMusic size={14} aria-hidden="true" />
                Queue
              </div>
              <div className="flex items-center gap-1">
                <IconButton
                  label="Clear queue"
                  size="sm"
                  tone="subtle"
                  onClick={() => {
                    void playback.clearQueue();
                  }}
                  disabled={tracks.length === 0}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </IconButton>
                <IconButton label="Close queue" size="sm" tone="subtle" onClick={onClose}>
                  <X size={16} aria-hidden="true" />
                </IconButton>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-2 py-3">
              {tracks.length === 0 ? (
                <EmptyQueue />
              ) : (
                <div className="space-y-1">
                  {tracks.map((track, index) => {
                    const isCurrent = index === currentIndex;
                    const heading =
                      currentTrack && index === 0 && currentIndex > 0
                        ? "Earlier"
                        : currentTrack && isCurrent
                          ? "Now playing"
                          : currentTrack && index === currentIndex + 1
                            ? "Next up"
                            : null;
                    return (
                      <Fragment key={track.id}>
                        {heading ? <SectionHeading label={heading} /> : null}
                        <QueueRow
                          index={index}
                          isCurrent={isCurrent}
                          isPlaying={isCurrent && status === "playing"}
                        />
                      </Fragment>
                    );
                  })}

                  {!hasNext && currentTrack ? (
                    <p className="px-3 py-6 text-center text-xs text-[var(--color-text-muted)]">
                      End of queue
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
      {label}
    </div>
  );
}

function EmptyQueue() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <ListMusic size={28} className="text-[var(--color-text-muted)]" aria-hidden="true" />
      <h3 className="text-sm text-[var(--color-text-primary)]">Queue is empty</h3>
      <p className="text-xs text-[var(--color-text-secondary)]">
        Start playback from an album, artist or playlist to fill it.
      </p>
    </div>
  );
}

interface QueueRowProps {
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
}

function QueueRow({ index, isCurrent, isPlaying }: QueueRowProps) {
  const track = useQueueStore((state) => state.tracks[index]);
  const playback = usePlayback();
  const { motionEnabled } = useMotionPreference();

  if (!track) {
    return null;
  }

  return (
    <div
      className={cn(
        "group grid grid-cols-[1fr_auto] items-center gap-2 rounded-md px-3 py-2",
        isCurrent ? "bg-[var(--color-surface-2)]" : "hover:bg-[var(--color-surface-2)]",
      )}
    >
      <button
        type="button"
        onClick={() => {
          void playback.playQueueIndex(index);
        }}
        className="flex min-w-0 items-center gap-3 text-left"
        aria-current={isCurrent ? "true" : undefined}
      >
        <Artwork
          src={track.artworkUrl ?? track.album?.artworkUrl}
          alt={track.album?.title ?? track.title}
          size={36}
          seedKey={track.album?.id ?? track.id}
          rounded="md"
        />
        <div className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate text-sm",
              isCurrent ? "text-[var(--color-album-accent)]" : "text-[var(--color-text-primary)]",
            )}
          >
            {track.title}
          </span>
          <span className="truncate text-xs text-[var(--color-text-secondary)]">
            {track.artist.name}
          </span>
        </div>
        {isCurrent && isPlaying ? <PlayingBars motionEnabled={motionEnabled} /> : null}
      </button>

      <IconButton
        label="Remove from queue"
        size="sm"
        tone="subtle"
        onClick={() => {
          void playback.removeFromQueue(index);
        }}
        className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X size={14} aria-hidden="true" />
      </IconButton>
    </div>
  );
}

function PlayingBars({ motionEnabled }: { motionEnabled: boolean }) {
  return (
    <span aria-hidden="true" className="ml-2 flex h-3 w-4 items-end gap-[2px]">
      <Bar motionEnabled={motionEnabled} delay={0} />
      <Bar motionEnabled={motionEnabled} delay={150} />
      <Bar motionEnabled={motionEnabled} delay={300} />
    </span>
  );
}

function Bar({ delay, motionEnabled }: { delay: number; motionEnabled: boolean }) {
  const heights = ["40%", "100%", "60%", "90%", "50%"] as const;
  if (!motionEnabled) {
    return (
      <span
        className="block w-[3px] rounded-sm bg-[var(--color-album-accent)]"
        style={{ height: "60%" }}
      />
    );
  }
  return (
    <motion.span
      className="block w-[3px] rounded-sm bg-[var(--color-album-accent)]"
      animate={{ height: [...heights] }}
      transition={{ duration: 0.9, repeat: Infinity, delay: delay / 1000, ease: "easeInOut" }}
      style={{ height: "60%" }}
    />
  );
}
