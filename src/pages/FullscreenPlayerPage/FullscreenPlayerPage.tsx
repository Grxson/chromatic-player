import { Minimize2 } from "lucide-react";
import { Content } from "@/components/layout/Content";
import { Header } from "@/components/layout/Header";
import { Artwork } from "@/components/music/Artwork";
import { PlayerControls } from "@/components/player/PlayerControls";
import { ProgressBar } from "@/components/player/ProgressBar";
import { VolumeControl } from "@/components/player/VolumeControl";
import { IconButton } from "@/components/common/IconButton";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayerStore } from "@/stores/player.store";

export interface FullscreenPlayerPageProps {
  onMinimize: () => void;
}

export function FullscreenPlayerPage({ onMinimize }: FullscreenPlayerPageProps) {
  const track = usePlayerStore((state) => state.currentTrack);
  const status = usePlayerStore((state) => state.status);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);

  const playback = usePlayback();
  const hasTrack = track !== null;

  return (
    <>
      <Header
        title="Now playing"
        subtitle={track ? track.artist.name : "No track selected"}
        actions={
          <IconButton label="Minimize" size="sm" tone="subtle" onClick={onMinimize}>
            <Minimize2 size={16} aria-hidden="true" />
          </IconButton>
        }
      />
      <Content>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 py-12 text-center">
          <Artwork
            src={track?.artworkUrl ?? track?.album?.artworkUrl}
            alt={track?.album?.title ?? track?.title ?? "Nothing playing"}
            size={320}
            rounded="md"
            className="shadow-2xl"
          />
          <div>
            <h2 className="text-2xl text-[var(--color-text-primary)]">
              {track?.title ?? "Nothing playing"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {track?.artist.name ?? "—"}
            </p>
          </div>
          <div className="w-full max-w-md">
            <ProgressBar
              position={position}
              duration={duration}
              onSeek={(value) => {
                void playback.seek(value);
              }}
            />
          </div>
          <PlayerControls
            isPlaying={status === "playing"}
            disabled={!hasTrack}
            onTogglePlay={() => {
              void playback.togglePlay();
            }}
            onNext={() => {
              void playback.next();
            }}
            onPrevious={() => {
              void playback.previous();
            }}
          />
          <VolumeControl
            volume={volume}
            onVolumeChange={(value) => {
              void playback.setVolume(value);
            }}
          />
        </div>
      </Content>
    </>
  );
}
