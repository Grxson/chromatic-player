/**
 * Chromatic palette metadata. This is UI / visual metadata that should NOT
 * live on the music domain entities. It is intentionally a separate
 * concern so that domain types stay purely musical.
 *
 * Variables are CSS-friendly (no spaces, predictable casing) so they can
 * be assigned directly to CSS custom properties.
 */
export interface ChromaticPalette {
  /** Hue used for accents, glows and current-track highlights. */
  hue: string;
  /** Dark accent used as a base tint for backgrounds. */
  deep: string;
  /** Mid-tone used for hover / selected surfaces. */
  mid: string;
  /** Soft tone used for ambient gradients. */
  soft: string;
}

/**
 * Fallback palette used when no `currentTrack` is playing. Keeps the
 * application visually consistent and dark at all times.
 */
export const FALLBACK_PALETTE: ChromaticPalette = {
  hue: "#c9c3b6",
  deep: "#101012",
  mid: "#161619",
  soft: "#1d1d20",
};
