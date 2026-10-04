import type { Track } from "@/domain/entities";
import type { PlaybackBackend } from "@/domain/ports";

export interface LocalPlaybackEvent {
  type: "timeupdate" | "durationchange" | "ended" | "play" | "pause" | "error";
  position?: number;
  duration?: number;
  error?: string;
}

export type LocalAudioResolver = (playbackRef: string) => string | undefined;

export class LocalPlaybackBackend implements PlaybackBackend {
  private readonly audio: HTMLAudioElement;
  private readonly listeners = new Set<(event: LocalPlaybackEvent) => void>();
  private currentPlaybackRef: string | null = null;

  constructor(
    private readonly resolveAudio: LocalAudioResolver,
    createAudio: () => HTMLAudioElement = () => new Audio(),
  ) {
    this.audio = createAudio();
    this.audio.preload = "metadata";
    this.audio.volume = 0.8;
    this.audio.addEventListener("timeupdate", this.emitPosition);
    this.audio.addEventListener("durationchange", this.emitDuration);
    this.audio.addEventListener("ended", this.emitEnded);
    this.audio.addEventListener("play", this.emitPlay);
    this.audio.addEventListener("pause", this.emitPause);
    this.audio.addEventListener("error", this.emitError);
  }

  async play(track: Track): Promise<void> {
    const playbackRef = track.playbackRef;
    const source = playbackRef ? this.resolveAudio(playbackRef) : undefined;
    if (!playbackRef || !source) {
      throw new Error(
        "TIDAL playback is unavailable in this build. Choose a local audio file instead.",
      );
    }

    if (this.currentPlaybackRef !== playbackRef) {
      this.audio.pause();
      this.audio.src = source;
      this.currentPlaybackRef = playbackRef;
      this.audio.load();
    }
    await this.audio.play();
  }

  async pause(): Promise<void> {
    this.audio.pause();
  }

  async resume(): Promise<void> {
    if (!this.audio.src) throw new Error("Choose a track before resuming playback.");
    await this.audio.play();
  }

  async seek(position: number): Promise<void> {
    if (!Number.isFinite(position)) throw new Error("Seek position must be a finite number.");
    this.audio.currentTime = Math.max(
      0,
      Math.min(position, Number.isFinite(this.audio.duration) ? this.audio.duration : position),
    );
  }

  async setVolume(volume: number): Promise<void> {
    this.audio.volume = Math.min(1, Math.max(0, volume));
  }

  subscribe(listener: (event: LocalPlaybackEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async stop(): Promise<void> {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.currentPlaybackRef = null;
  }

  dispose(): void {
    void this.stop();
    this.audio.removeEventListener("timeupdate", this.emitPosition);
    this.audio.removeEventListener("durationchange", this.emitDuration);
    this.audio.removeEventListener("ended", this.emitEnded);
    this.audio.removeEventListener("play", this.emitPlay);
    this.audio.removeEventListener("pause", this.emitPause);
    this.audio.removeEventListener("error", this.emitError);
    this.listeners.clear();
  }

  private readonly emit = (event: LocalPlaybackEvent) => {
    for (const listener of this.listeners) listener(event);
  };

  private readonly emitPosition = () => {
    this.emit({ type: "timeupdate", position: this.audio.currentTime });
  };

  private readonly emitDuration = () => {
    if (Number.isFinite(this.audio.duration)) {
      this.emit({ type: "durationchange", duration: this.audio.duration });
    }
  };

  private readonly emitEnded = () => this.emit({ type: "ended" });
  private readonly emitPlay = () => this.emit({ type: "play" });
  private readonly emitPause = () => this.emit({ type: "pause" });
  private readonly emitError = () =>
    this.emit({
      type: "error",
      error: "This audio file could not be played by the system audio engine.",
    });
}
