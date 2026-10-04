/** Provider-neutral origin for a prepared playback queue. */
export interface PlaybackSource {
  type: "album" | "playlist" | "artist" | "search" | "queue";
  id?: string;
}
