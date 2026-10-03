/**
 * Mock catalogue artwork for the prototype. The Artwork component can
 * resolve any of these by `albumId`, `artistId` or `playlistId`. For
 * artist and playlist cases we reuse the closest related artwork so the
 * prototype always has something to render.
 *
 * The rendered artwork is a generated SVG gradient — no remote URLs,
 * no copyrighted material.
 */

export interface MockArtworkSeed {
  /** Primary tone for the radial gradient. */
  from: string;
  /** Secondary tone for the angular gradient stop. */
  to: string;
  /** Accent highlight tone, used sparingly. */
  accent: string;
  /** Layout hint: drives the SVG geometry variant. */
  variant: "aurora" | "halo" | "fold" | "veins" | "ridge" | "depth";
}

export const ARTWORK: Record<string, MockArtworkSeed> = {
  "album-soft-static": { from: "#1f2849", to: "#3a4f7a", accent: "#7a8aa6", variant: "aurora" },
  "album-echoes-in-amber": { from: "#3a1f0d", to: "#7a4514", accent: "#c6915a", variant: "fold" },
  "album-velvet-hours": { from: "#2a0e1d", to: "#5a224a", accent: "#8a5a78", variant: "veins" },
  "album-north-exit": { from: "#0a2424", to: "#205a52", accent: "#5a8a78", variant: "ridge" },
  "album-slow-collapse": { from: "#2a1a0e", to: "#6a3014", accent: "#9a6a4a", variant: "depth" },
  "album-glass-hours": { from: "#0e1a24", to: "#2a445a", accent: "#6a7a8a", variant: "halo" },
  "album-after-midnight": { from: "#160e22", to: "#3a1e5a", accent: "#5a4a7a", variant: "veins" },
  "album-moraine": { from: "#0e1a14", to: "#2a4a3a", accent: "#7a8a78", variant: "ridge" },

  "artist-velvet-static": { from: "#1a141e", to: "#3a2a4a", accent: "#7a5a8a", variant: "halo" },
  "artist-after-midnight": { from: "#0a0a14", to: "#1a1430", accent: "#4a3a7a", variant: "depth" },
  "artist-moraine": { from: "#0e1410", to: "#1a3024", accent: "#5a7a6a", variant: "ridge" },
  "artist-north-exit": { from: "#0a1414", to: "#1a3030", accent: "#4a7a6a", variant: "ridge" },
  "artist-slow-collapse": { from: "#1a0e08", to: "#3a1f0d", accent: "#7a4a2a", variant: "depth" },
  "artist-glass-hours": { from: "#0a1015", to: "#1a2a3a", accent: "#4a6a7a", variant: "halo" },

  "playlist-late-hours": { from: "#140e1a", to: "#3a2a5a", accent: "#7a6a9a", variant: "fold" },
  "playlist-soft-instrumentals": {
    from: "#0a141a",
    to: "#1a304a",
    accent: "#5a7a9a",
    variant: "aurora",
  },
  "playlist-midnight-drive": {
    from: "#0a0a14",
    to: "#1a142a",
    accent: "#5a4a7a",
    variant: "depth",
  },
  "playlist-daylight-still": { from: "#141008", to: "#3a2a14", accent: "#9a7a4a", variant: "halo" },
  "playlist-ambient-tapes": { from: "#0a1410", to: "#1a302a", accent: "#5a8a7a", variant: "veins" },
};

export function artworkFor(key: string): MockArtworkSeed {
  return ARTWORK[key] ?? { from: "#161619", to: "#1d1d20", accent: "#c9c3b6", variant: "halo" };
}
