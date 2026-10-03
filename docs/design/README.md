# Design

Chromatic Player's visual identity is called **Chromatic Dark** (or
**Adaptive Chromatic Dark** when reacting to album artwork).

## Mood

```text
dark
ambient
introspective
elegant
cinematic
modern
clean
slightly melancholic
```

## Foundations

- **Dark base** — neutral warm-tinted canvas, never pure black.
- **Album reactive** — surface tokens can be tinted by the dominant
  palette of the currently playing artwork. The mock engine maps each
  album to a `ChromaticPalette`; a future extraction pipeline will
  replace that map.
- **Minimal motion** — only fade, small translate, small scale and
  layout transitions. No permanent animations.
- **Artwork focused** — album art is the visual hero. Other UI stays
  restrained to support it.
- **Performance conscious** — system fonts, no remote assets, no heavy
  effects. The application must remain responsive on modest hardware.

## Token reference

Tokens are defined in `src/styles/theme.css` and `src/styles/chromatic.css`:

| Group         | Token                  | Value                       |
| ------------- | ---------------------- | --------------------------- |
| Surface       | `--color-canvas`       | `#080809`                   |
| Surface       | `--color-surface`      | `#101012`                   |
| Surface       | `--color-surface-2`    | `#161619`                   |
| Surface       | `--color-elevated`     | `#1D1D20`                   |
| Text          | `--color-text-primary` | `#F2F1ED`                   |
| Text          | `--color-text-secondary` | `#9C9CA1`                 |
| Text          | `--color-text-muted`   | `#646468`                   |
| Border        | `--color-border`       | `rgba(255,255,255,0.07)`    |
| Reactive      | `--album-dominant`     | `#2a2a30` (fallback)        |
| Reactive      | `--album-secondary`    | `#1f1f24` (fallback)        |
| Reactive      | `--album-accent`       | `#5a5a64` (fallback)        |
| Reactive      | `--album-dark`         | `#0c0c0e` (fallback)        |
| Reactive      | `--album-light`        | `#d8d8de` (fallback)        |
| Glow          | `--chromatic-glow-primary`   | `rgba(201,195,182,0.18)` (fallback) |
| Glow          | `--chromatic-glow-secondary` | `rgba(255,255,255,0.02)`          |
| Hue           | `--chromatic-hue`      | `#c9c3b6` (fallback)        |

The reactive values are overwritten at runtime by `useChromaticTheme`
whenever the `currentTrack` changes.

## Anti-patterns

We avoid:

- RGB / cyberpunk neon;
- permanent glow effects;
- heavy glassmorphism and backdrop blur;
- excessive border radius;
- constantly animating cards;
- visual clones of Spotify, Apple Music or TIDAL.

## Accessibility

- All interactive elements have accessible labels or `aria` semantics.
- Focus styles are visible via `focus-visible:ring` on every actionable
  element.
- Motion respects `prefers-reduced-motion`.