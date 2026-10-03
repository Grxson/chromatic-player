import type { ChromaticPalette } from "./chromatic.types";

/**
 * Mock chromatic palettes keyed by `albumId`. The mapping is intentional:
 * every album in the mock catalogue has its own tone so the prototype
 * actually demonstrates the album-reactive atmosphere. Palettes are kept
 * cinematic, dark-compatible and desaturated — never neon.
 *
 * When real colour extraction arrives (post v0.1.0) this map will be
 * replaced by a derivation from artwork.
 */
export const CHROMATIC_PALETTES: Record<string, ChromaticPalette> = {
  "album-soft-static": {
    hue: "#7a8aa6",
    deep: "#0d121b",
    mid: "#161c2a",
    soft: "#1f2839",
  },
  "album-echoes-in-amber": {
    hue: "#c6915a",
    deep: "#1a1109",
    mid: "#241910",
    soft: "#2f2316",
  },
  "album-velvet-hours": {
    hue: "#8a5a78",
    deep: "#160e16",
    mid: "#1f1421",
    soft: "#2a1a2d",
  },
  "album-north-exit": {
    hue: "#5a8a78",
    deep: "#0a1517",
    mid: "#102624",
    soft: "#163430",
  },
  "album-slow-collapse": {
    hue: "#9a6a4a",
    deep: "#180f0a",
    mid: "#221610",
    soft: "#2c1d15",
  },
  "album-glass-hours": {
    hue: "#6a7a8a",
    deep: "#0c1015",
    mid: "#141a22",
    soft: "#1c2330",
  },
  "album-after-midnight": {
    hue: "#5a4a7a",
    deep: "#100b16",
    mid: "#171020",
    soft: "#1f162a",
  },
  "album-moraine": {
    hue: "#7a8a78",
    deep: "#0e1510",
    mid: "#161e18",
    soft: "#1d2820",
  },
};
