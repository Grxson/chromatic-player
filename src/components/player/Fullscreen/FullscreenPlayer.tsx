import { useMemo } from "react";
import { motion } from "motion/react";
import { Minimize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Artwork } from "@/components/music/Artwork";
import { IconButton } from "@/components/common/IconButton";
import { ProgressBar } from "@/components/player/ProgressBar";
import { VolumeControl } from "@/components/player/VolumeControl";
import { Header } from "@/components/layout/Header";
import { usePlayerStore } from "@/stores/player.store";
import { usePlayback } from "@/hooks/usePlayback";
import { lyricsFor } from "@/mocks/lyrics/lyrics";
import { cn } from "@/utils/cn";

export interface FullscreenPlayerProps {
  onMinimize: () => void;
}

const FADE = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.005 },
} as const;

export function FullscreenPlayer({ onMinimize }: FullscreenPlayerProps) {
  const track = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);
  const playback = usePlayback();

  const hasTrack = track !== null;
  const isPlaying = status === "playing";

  const lyrics = useMemo(
    () => (track ? (lyricsFor(track.id) ?? placeholderLines(track.title)) : []),
    [track],
  );

  const currentLineIndex = useMemo(() => {
    if (lyrics.length === 0 || duration === 0) {
      return -1;
    }
    const ratio = Math.min(1, position / duration);
    return Math.min(lyrics.length - 1, Math.floor(ratio * lyrics.length));
  }, [lyrics.length, position, duration]);

  return (
    <motion.section
      initial={FADE.initial}
      animate={FADE.animate}
      exit={FADE.exit}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--color-canvas)]"
      data-state={status}
    >
      <Background seedKey={track?.album?.id ?? "neutral"} />

      <div className="relative z-10 flex h-full flex-col">
        <Header
          eyebrow="Now playing"
          title={track?.title ?? "Nothing playing"}
          subtitle={track ? `${track.artist.name} · ${track.album?.title ?? ""}` : undefined}
          actions={
            <IconButton label="Minimize" size="sm" tone="subtle" onClick={onMinimize}>
              <Minimize2 size={16} aria-hidden="true" />
            </IconButton>
          }
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-8 pb-10 lg:flex-row lg:items-center lg:justify-center lg:gap-16">
          {hasTrack ? (
            <ArtworkPanel
              title={track.title}
              albumTitle={track.album?.title ?? ""}
              seedKey={track.album?.id ?? track.id}
            />
          ) : (
            <EmptyPanel />
          )}

          {hasTrack && lyrics.length > 0 ? (
            <LyricsPanel lines={lyrics} currentIndex={currentLineIndex} isPlaying={isPlaying} />
          ) : null}
        </div>

        <div className="z-10 mx-auto flex w-full max-w-3xl flex-col gap-4 px-8 pb-8">
          <ProgressBar
            position={position}
            duration={duration}
            onSeek={(value) => {
              void playback.seek(value);
            }}
          />
          <div className="flex items-center justify-between gap-4">
            <div className="hidden md:block">
              <VolumeControl
                volume={volume}
                onVolumeChange={(value) => {
                  void playback.setVolume(value);
                }}
              />
            </div>
            <div className="flex items-center gap-2 md:mx-auto">
              <IconButton
                label="Previous"
                size="md"
                tone="subtle"
                onClick={() => {
                  void playback.previous();
                }}
                disabled={!hasTrack}
              >
                <SkipBack size={18} aria-hidden="true" />
              </IconButton>
              <IconButton
                label={isPlaying ? "Pause" : "Play"}
                size="lg"
                tone="primary"
                onClick={() => {
                  void playback.togglePlay();
                }}
                disabled={!hasTrack}
                className="h-12 w-12"
              >
                {isPlaying ? (
                  <Pause size={22} aria-hidden="true" />
                ) : (
                  <Play size={22} aria-hidden="true" className="translate-x-[1px]" />
                )}
              </IconButton>
              <IconButton
                label="Next"
                size="md"
                tone="subtle"
                onClick={() => {
                  void playback.next();
                }}
                disabled={!hasTrack}
              >
                <SkipForward size={18} aria-hidden="true" />
              </IconButton>
            </div>
            <div className="hidden w-32 md:block" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Background({ seedKey }: { seedKey: string }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 18% 30%, var(--chromatic-glow-primary), transparent 70%), radial-gradient(60% 80% at 90% 80%, var(--chromatic-glow-secondary), transparent 75%), linear-gradient(180deg, var(--color-canvas), var(--color-canvas))",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--chromatic-glow-primary)" }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 bottom-0 h-[460px] w-[460px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--album-secondary)" }}
      />
      <Vignette />
      <span aria-hidden="true" className="sr-only">
        {seedKey}
      </span>
    </>
  );
}

function Vignette() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  );
}

function ArtworkPanel({
  title,
  albumTitle,
  seedKey,
}: {
  title: string;
  albumTitle: string;
  seedKey: string;
}) {
  return (
    <div className="relative shrink-0" style={{ width: "min(360px, 70vw)", aspectRatio: "1 / 1" }}>
      <div
        aria-hidden="true"
        className="absolute -inset-10 rounded-3xl opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(60% 60% at 50% 50%, var(--album-accent), transparent 70%)",
        }}
      />
      <Artwork
        src={undefined}
        alt={albumTitle || title}
        seedKey={seedKey}
        size={420}
        rounded="md"
        className="relative shadow-2xl"
      />
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="flex max-w-sm flex-col items-center gap-3 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
        <Play size={28} aria-hidden="true" />
      </div>
      <h3 className="text-lg text-[var(--color-text-primary)]">Nothing playing</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Choose something from Home, Search or your Library.
      </p>
    </div>
  );
}

interface LyricsPanelProps {
  lines: string[];
  currentIndex: number;
  isPlaying: boolean;
}

function LyricsPanel({ lines, currentIndex, isPlaying }: LyricsPanelProps) {
  const previous = currentIndex > 0 ? lines[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < lines.length - 1 ? lines[currentIndex + 1] : null;
  const current = currentIndex >= 0 ? lines[currentIndex] : lines[0];

  return (
    <div className="flex w-full max-w-md flex-col gap-6 lg:max-w-lg">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
        Lyrics
      </p>
      <div className="space-y-3">
        {previous ? (
          <p className="text-base text-[var(--color-text-secondary)] opacity-30">{previous}</p>
        ) : null}
        <p
          className={cn(
            "text-2xl font-medium leading-snug text-[var(--color-text-primary)]",
            !isPlaying && currentIndex >= 0 && "italic opacity-80",
          )}
        >
          {current}
        </p>
        {next ? (
          <p className="text-base text-[var(--color-text-secondary)] opacity-40">{next}</p>
        ) : null}
      </div>
    </div>
  );
}

function placeholderLines(title: string): string[] {
  return [
    `Lyrics for ${title} are not available yet.`,
    "Mock placeholder keeps the layout verifiable while real lyrics land in a later release.",
    "The prose shown above is entirely fictional and intentionally ambient.",
  ];
}
