# Architectural Decision Records

This directory holds the ADRs (Architectural Decision Records) for the
project. Each decision is short and links back to the implementation
files when relevant.

## Tailwind CSS v4 with the Vite plugin

We use Tailwind v4 with `@tailwindcss/vite` and CSS-first config via
`@theme inline`. This is the currently recommended setup, avoids
PostCSS configuration noise and works well with Vite + Tauri.

## Path aliases via Vite's native resolver

TypeScript `paths` (in `tsconfig.json`) is the single source of truth
for import aliases. Vite 8 reads the same paths via
`resolve.tsconfigPaths: true` (`vite.config.ts`), so we do not need any
extra plugin.

## `MusicProvider` is the only seam

There is exactly one port (`MusicProvider`) that crosses from the
application to any backend. We do not introduce additional ports
(`TrackRepository`, `AlbumRepository`, …) until there is a concrete
second implementation that benefits from them.

## `MusicProvider` does not own queue navigation

The provider's contract exposes only single-track playback operations
(`play`, `pause`, `resume`, `seek`, `setVolume`). Queue sequencing is
owned by the application through `QueueStore` + `usePlayback`, regardless
of which backend is active. This keeps the UI in full control and
makes TIDAL (or any future provider) pluggable without UI changes.

## The Queue owns the cursor

`QueueStore` is the single source of truth for "what comes next". It
exposes `moveNext` / `movePrevious` / `jumpTo` / `hasNext` / `hasPrevious`
/ `getCurrentTrack` / `enqueue` / `removeAt` / `clear` / `append`.
Components never compute next-track indexes themselves; they call the
store and the playback layer dispatches the new track to the provider.

`playQueueIndex(index)` MUST go through `QueueStore.jumpTo(index)`
before preparing the track so that Next / Previous flow from the
selected row, not from the previous cursor position.

## Playback coordination through `usePlayback`

UI components must never call `MusicProvider.play` directly and must not
mutate `PlayerStore.currentTrack` on their own. They go through
`usePlayback` (in `src/hooks/usePlayback.ts`). The hook coordinates
`PlayerStore`, `QueueStore` and `MusicProvider` so the three stay
synchronised even when a provider call fails.

### Contextual queue playback

`usePlayback` exposes `playTrack(track)`, `playTracks(tracks)` and
`playQueue(tracks, startIndex)`. Album / Artist / Playlist / Home
sections call `playQueue` so Next / Previous flow naturally through the
source collection.

### Async status lifecycle

Playback transitions go through `loading` before resolving to
`playing`, `paused` or `error`. On error the previous player snapshot
is restored: the requested track stays visible in the UI, the status
flips to `error` and a short message lands in `PlayerStore.error`. The
queue mutation is not rolled back.

### Removing the current track

`usePlayback.removeFromQueue(index)` coordinates the playback transition
when the user removes the current track from the queue:

- Non-current → cursor adjusts, playback untouched.
- Current + next exists → next track becomes current, provider plays.
- Current + previous only → previous track becomes current, provider plays.
- Current + only track → pause, queue empty, player idle.

`QueueDrawer` MUST call `usePlayback.removeFromQueue(index)` and never
`useQueueStore.getState().removeAt(index)` directly.

## Routing is in-memory for now

Routing is implemented as an in-memory context provider instead of
pulling `react-router`. The application surface is small enough that
this is the simplest solution and avoids an extra dependency.

The fullscreen player remembers the previous non-fullscreen route in a
ref so Escape / Minimize return the user to where they were, instead
of always Home.

## Zustand for client state

Stores are split by concern (`auth`, `player`, `queue`, `library`,
`settings`) instead of consolidated into a single root store. Each
store owns its actions and selectors.

## `volume` lives on `PlayerStore`, not `SettingsStore`

The current player volume is live playback state and therefore lives
on `PlayerStore`. `SettingsStore` holds persistent preferences (theme,
animations, sidebar collapse, audio quality, …). `useMuteMemory`
remembers the previous volume across mute toggles so the user does
not lose their audio level when pressing `M`.

## Visual metadata lives in `src/features/chromatic/`

Album palettes are UI metadata. They live in `chromatic.mock.ts` (and
soon in a real extraction pipeline) and are never part of the music
domain entities.

## Chromatic theme as CSS custom properties

`useChromaticTheme` writes the active palette to the document root as
`--chromatic-hue`, `--album-dominant`, `--album-accent`,
`--chromatic-glow-primary` etc. Components reference the variables;
they never look up colours directly.

## Motion reserved, not pervasive

Motion is installed but the foundation intentionally avoids animations
beyond CSS-level fade / scale / translate. Real motion design lands in
the v0.3.0 milestone.

`useMotionPreference` combines the OS-level `prefers-reduced-motion`
query with the application-level `settings.animations` toggle. Either
of them disabling motion switches Motion variants to `initial: false`
(no-op) so the rest of the UI is unaffected.

## `Cargo.lock` is versioned

This is an application, not a published library, so `Cargo.lock` is
checked in. CI uses `cargo check --locked` for reproducible validation.

## WebKitGTK 4.1 is the correct runtime

Tauri 2 on Linux links against **WebKitGTK API 4.1** (not 4.0). The
Ubuntu runner installs `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`,
`libayatana-appindicator3-dev`, `librsvg2-dev`, `libssl-dev` and
`pkg-config`.

## Stale-result-safe async resources

`useAsyncResource` uses `useReducer` so the reset to `loading` is a
pure state transition. A `cancelled` flag guards against stale results.
The Search page layers a request sequence counter on top so only the
most recent query can update the UI.

## Desktop keyboard shortcuts

`usePlayerShortcuts` wires `Space` / `Arrow` / `M` / `F` / `Q` /
`Escape` to the playback layer. The hook reads the latest values
through refs so successive key presses always see fresh state.
Shortcuts are ignored while focus is inside an editable control so
typing in Search (or any future input) never triggers transport
actions.