import { useEffect, useRef } from "react";
import type { ChromaticPalette } from "./chromatic.types";
import { FALLBACK_PALETTE } from "./chromatic.types";
import { CHROMATIC_PALETTES } from "./chromatic.mock";

/**
 * Resolves the chromatic palette for a given albumId (or `null` when no
 * track is loaded). Falls back to the neutral palette when no mapping
 * exists so the application never goes visually broken.
 */
export function resolveChromaticPalette(albumId: string | null): ChromaticPalette {
  if (albumId === null) {
    return FALLBACK_PALETTE;
  }
  return CHROMATIC_PALETTES[albumId] ?? FALLBACK_PALETTE;
}

/**
 * Applies a chromatic palette to the document root as CSS custom
 * properties. The hook is idempotent and safe to call on every render;
 * DOM writes only happen when the palette identity actually changes.
 *
 * Variable mapping:
 *
 *   --chromatic-hue       palette.hue
 *   --chromatic-deep      palette.deep
 *   --chromatic-mid       palette.mid
 *   --chromatic-soft      palette.soft
 *
 *   --album-dominant      palette.deep
 *   --album-secondary     palette.mid
 *   --album-accent        palette.hue
 *   --album-dark          palette.deep
 *   --album-light         palette.soft
 *
 *   --chromatic-glow-primary  palette.hue @ 18% opacity
 *   --chromatic-glow-secondary palette.hue @ 8% opacity
 */
export function useChromaticTheme(albumId: string | null): ChromaticPalette {
  const palette = resolveChromaticPalette(albumId);
  const previousIdRef = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const key = albumId ?? "__fallback__";
    if (previousIdRef.current === key) {
      return;
    }
    previousIdRef.current = key;

    root.style.setProperty("--chromatic-hue", palette.hue);
    root.style.setProperty("--chromatic-deep", palette.deep);
    root.style.setProperty("--chromatic-mid", palette.mid);
    root.style.setProperty("--chromatic-soft", palette.soft);

    root.style.setProperty("--album-dominant", palette.deep);
    root.style.setProperty("--album-secondary", palette.mid);
    root.style.setProperty("--album-accent", palette.hue);
    root.style.setProperty("--album-dark", palette.deep);
    root.style.setProperty("--album-light", palette.soft);

    root.style.setProperty("--chromatic-glow-primary", hexToRgba(palette.hue, 0.18));
    root.style.setProperty("--chromatic-glow-secondary", hexToRgba(palette.hue, 0.08));

    root.dataset.aurora = albumId ?? "neutral";
  }, [albumId, palette]);

  return palette;
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.startsWith("#") ? hex.slice(1) : hex;
  if (value.length !== 6) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
