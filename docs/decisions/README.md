# Architectural Decision Records

This directory will hold ADRs (Architectural Decision Records) once
non-trivial decisions are made.

For now, the active decisions are summarised below.

## Tailwind CSS v4 with the Vite plugin

We use Tailwind v4 with `@tailwindcss/vite` and CSS-first config via
`@theme inline`. This is the currently recommended setup, avoids
PostCSS configuration noise and works well with Vite + Tauri.

## Path aliases via `vite-tsconfig-paths`

The TypeScript `paths` configuration is the single source of truth for
import aliases. `vite-tsconfig-paths` mirrors those resolutions into
Vite so we do not duplicate aliases between tools.

## `MusicProvider` is the only seam

There is exactly one port (`MusicProvider`) that crosses from the
application to any backend. We do not introduce additional ports
(TrackRepository, AlbumRepository, …) until there is a concrete second
implementation that benefits from them.

## Routing is in-memory for now

Routing is implemented as an in-memory context provider instead of
pulling `react-router`. The application surface is small enough that
this is the simplest solution and avoids an extra dependency. A real
router can replace it later without changing the rest of the
architecture.

## Zustand for client state

Stores are split by concern (`auth`, `player`, `queue`, `library`,
`settings`) instead of consolidated into a single root store. Each
store owns its actions and selectors.

## Motion reserved, not pervasive

`motion` is installed but the foundation intentionally avoids
animations beyond CSS-level fade / scale / translate. Real motion
design lands in the v0.3.0 milestone.