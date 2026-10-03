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
  palette of the currently playing artwork. Falls back to the neutral
  palette until real extraction is enabled.
- **Minimal motion** — only fade, small translate, small scale and
  layout transitions. No permanent animations.
- **Artwork focused** — album art is the visual hero. Other UI stays
  restrained to support it.
- **Performance conscious** — system fonts, no remote assets, no heavy
  effects. The application must remain responsive on modest hardware.

## Token reference

Tokens are defined as CSS variables in `src/styles/theme.css` and
`src/styles/chromatic.css`:

| Group         | Token                  | Value                       |
| ------------- | ---------------------- | --------------------------- |
| Surface       | `--color-canvas`       | `#080809`                   |
| Surface       | `--color-surface`      | `#101012`                   |
| Surface       | `--color-surface-2`    | `#161619`                   |
| Surface       | `--color-elevated`     | `#1d1d20`                   |
| Text          | `--color-text-primary` | `#f2f1ed`                   |
| Text          | `--color-text-secondary` | `#9c9ca1`                 |
| Text          | `--color-text-muted`   | `#646468`                   |
| Border        | `--color-border`       | `rgba(255,255,255,0.07)`    |
| Reactive      | `--color-album-dominant` (placeholder) | `#2a2a30`     |
| Reactive      | `--color-album-secondary` (placeholder) | `#1f1f24`     |
| Reactive      | `--color-album-accent` (placeholder) | `#5a5a64`        |
| Reactive      | `--color-album-dark` (placeholder) | `#0c0c0e`           |
| Reactive      | `--color-album-light` (placeholder) | `#d8d8de`          |
| Global        | `--chromatic-background`, `--chromatic-foreground`, `--chromatic-accent`, `--chromatic-accent-muted`, `--chromatic-glow-primary`, `--chromatic-glow-secondary` | (fallbacks) |

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