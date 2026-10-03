# Architectural Decision Records

This directory holds the ADRs (Architectural Decision Records) for the
project. Each decision is short and links back to the implementation
files when relevant.

## Tailwind CSS v4 with the Vite plugin

We use Tailwind v4 with `@tailwindcss/vite` and CSS-first config via
`@theme inline`. This is the currently recommended setup, avoids
PostCSS configuration noise and works well with Vite + Tauri.

## Path aliases via Vite's native resolver

TypeScript `paths` (in `tsconfig.json`) is the single source of truth for
import aliases. Vite 8 reads the same paths via
`resolve.tsconfigPaths: true` (`vite.config.ts`), so we do not need any
extra plugin. The earlier `vite-tsconfig-paths` plugin has been removed
along with its dependency.

## `MusicProvider` is the only seam

There is exactly one port (`MusicProvider`) that crosses from the
application to any backend. We do not introduce additional ports
(`TrackRepository`, `AlbumRepository`, …) until there is a concrete
second implementation that benefits from them.

## `MusicProvider` does not own queue navigation

The provider's contract exposes only single-track playback operations
(`play`, `pause`, `resume`, `seek`, `setVolume`). It does NOT expose
`next` / `previous`. Queue sequencing is owned by the application
through `QueueStore` + `usePlayback`, regardless of which backend is
active. This keeps the UI in full control and makes TIDAL (or any
future provider) pluggable without UI changes.

## The Queue owns the cursor

`QueueStore` is the single source of truth for "what comes next". It
exposes `moveNext` / `movePrevious` / `jumpTo` / `hasNext` / `hasPrevious`
/ `getCurrentTrack`. Components never compute next-track indexes
themselves; they call the store and the playback layer dispatches the
new track to the provider.

## Playback coordination through `usePlayback`

UI components must never call `MusicProvider.play` directly and must not
mutate `PlayerStore` on their own. They go through `usePlayback` (in
`src/hooks/usePlayback.ts`). The hook coordinates `PlayerStore`,
`QueueStore` and `MusicProvider` so the three stay synchronised.

```
UI components
   ↓
usePlayback
   ↓
QueueStore + PlayerStore + MusicProvider
```

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

## `volume` lives on `PlayerStore`, not `SettingsStore`

The current player volume is live playback state and therefore lives on
`PlayerStore`. `SettingsStore` holds persistent preferences (theme,
animations, sidebar collapse, audio quality, …). If we later need a
"default volume at startup" it will be a separate `defaultVolume` field
on `SettingsStore` with that exact meaning — not a duplicate `volume`.

## Motion reserved, not pervasive

`motion` is installed but the foundation intentionally avoids
animations beyond CSS-level fade / scale / translate. Real motion
design lands in the v0.3.0 milestone.

## `Cargo.lock` is versioned

This is an application, not a published library, so `Cargo.lock` is
checked in. CI uses `cargo check --locked` for reproducible validation.