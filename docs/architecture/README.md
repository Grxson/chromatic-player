# Architecture

Chromatic Player uses a **lightweight layered architecture** that
prioritises separation of responsibilities, simplicity and long-term
maintainability. It is intentionally not a strict Clean Architecture
implementation — there are no abstract factories, repositories or
indirections without a real need.

## Layers

```
Presentation
   ↓
Application
   ↓
Domain
   ↓
Infrastructure
```

| Layer            | What lives here                                       |
| ---------------- | ----------------------------------------------------- |
| Presentation     | React components, pages, layout, app shell            |
| Application      | Zustand stores, hooks, providers, router              |
| Domain           | Entities, value objects, ports (interfaces)           |
| Infrastructure   | Concrete implementations (TidalProvider, MockMusicProvider, storage) |
| Features         | Cross-cutting UX surfaces (chromatic, queue, library)  |

### Presentation

Components in `src/components/` and `src/pages/` are presentational and
free of business logic. They consume stores via hooks and call the
application layer.

### Application

Coordination layer in `src/stores/`, `src/hooks/`, `src/app/providers/`
and `src/app/router/`. Translates user intent into provider calls and
keeps the UI reactive.

### Domain

Pure types and contracts in `src/domain/`. The `MusicProvider`
interface is the sole seam between the application and any concrete
music backend. The domain has no dependency on infrastructure.

### Infrastructure

Concrete adapters in `src/infrastructure/`. `MockMusicProvider`
implements the full port against static data. `TidalProvider` will
arrive in a later release.

### Features

Feature-shaped surfaces that cut across the layers: `src/features/chromatic/`
owns the Chromatic Engine, `src/features/queue/` owns the Queue drawer,
`src/features/library/` hosts the Library tabs. They consume
application + domain layers — they never add features.

## Provider seam

```
React UI
   ↓
usePlayerShortcuts / useMotionPreference
   ↓
usePlayback (src/hooks/usePlayback.ts)
   ↓
QueueStore + PlayerStore (src/stores/)
   ↓
MusicProvider  ←  port
   ↓
TidalProvider / MockMusicProvider  ←  adapters
```

The application never imports from `src/infrastructure/tidal` or
`src/infrastructure/mock` directly except through provider composition
in `src/app/providers/`. This keeps the UI agnostic about which backend
is active.

## Playback coordination

Single track playback (`play` / `pause` / `resume` / `seek` / `setVolume`)
is delegated to the provider. Queue navigation (`enqueue` / `removeAt` /
`clear` / `moveNext` / `movePrevious` / `jumpTo`) is owned by
`QueueStore`. Both are wired together by `usePlayback` so the UI calls
one method and the rest of the system stays consistent.

```
UI component
   ↓
usePlayback.playTrack(track) / .playQueue(tracks, i) / .playQueueIndex(i) / .next() / .seek(position) / .setVolume(v)
   ↓
QueueStore      ← cursor + tracks
Provider        ← single-track transport
PlayerStore     ← observable state for the UI
```

`usePlayback` is the only place in the application that mutates all
three together. Components never reach into the provider directly and
they never compute next-track indexes themselves.

### Status lifecycle

`PlayerStore.status` moves through:

```
idle ─► loading ─► playing
                  ▲
                  └──► paused ─► playing
                              ▲
                              └──► error
```

Every `usePlayback` action transitions to `loading` before calling the
provider and then resolves to `playing` / `paused` / `error`. On error,
the previous player snapshot is restored: the queue stays mutated,
the requested track stays visible, the status flips to `error` and a
short message lands in `PlayerStore.error`. The `clearQueue`,
`removeFromQueue` and `pause` paths handle the queue-empty case.

### Removal of the current track

`usePlayback.removeFromQueue(index)` is the only place that mutates
playback in response to a removal. Behaviour:

- Non-current track → cursor adjusts, playback untouched.
- Current track + next exists → cursor lands on the next, provider plays.
- Current track + only remaining → cursor goes to the previous, provider plays.
- Current track + last track → pause + reset player to idle.

### Mute memory

`useMuteMemory` is a tiny helper that stashes the previous volume
across mute toggles so the user does not lose their audio level when
they press `M`.

## Chromatic Engine

`useChromaticTheme` (in `src/features/chromatic/`) maps the current
`albumId` to a `ChromaticPalette` and writes the palette to the
document root as CSS custom properties (`--chromatic-hue`,
`--chromatic-glow-primary`, `--album-dominant`, …). The hook is
idempotent: DOM writes only happen when the palette identity changes.

## Keyboard shortcuts

`usePlayerShortcuts` (in `src/hooks/`) wires the desktop keyboard
shortcuts (`Space` / `Arrow` / `M` / `F` / `Q` / `Escape`) to the
playback layer. The hook always reads the latest `queueOpen` and
`route` through refs so successive events see the freshest values.

Escape priority is fixed:

```
Escape: queue closed first → otherwise fullscreen closed → no-op
```

Shortcuts are ignored while the focus is inside an editable control.

## Folder layout

```text
src/
├── app/                 # Composition root (App, router, providers)
├── components/
│   ├── common/          # Buttons, sliders, toasts, etc.
│   ├── layout/          # AppShell, Sidebar, Header, Content
│   ├── music/           # Artwork, cards, rows
│   └── player/          # MiniPlayer, controls, progress, volume, fullscreen
├── domain/
│   ├── entities/        # Track, Album, Artist, Playlist, User
│   ├── models/          # Composite value types
│   └── ports/           # MusicProvider + supporting contracts
├── infrastructure/
│   ├── mock/            # MockMusicProvider
│   ├── tidal/           # TidalProvider (future)
│   └── storage/         # Persistent settings (future)
├── features/
│   ├── chromatic/       # Album-reactive palette + theme hook
│   ├── queue/           # Queue drawer
│   └── library/         # Library tabs
├── stores/              # auth, player, queue, library, settings
├── hooks/               # usePlayback, useAsyncResource, usePlayerShortcuts, …
├── pages/               # Route-level views
├── mocks/               # Static mock data + artwork + chromatic palettes
├── styles/              # Global CSS + design tokens
├── types/               # Cross-cutting type helpers
├── utils/               # Pure utility functions
└── test/                # Vitest tests
```

## Principles

- **Domain stays pure.** No TIDAL types inside `src/domain/`.
- **UI never talks to providers directly.** Always through `usePlayback`.
- **No direct `setState` on the stores from `usePlayback`.** The hook
  goes through the public actions of `QueueStore` (`enqueue`, `jumpTo`,
  `removeAt`, `clear`) and `PlayerStore` (`setCurrentTrack`,
  `setStatus`, `setPosition`, `setDuration`, `setError`).
- **Visual metadata lives in `src/features/chromatic/`** — never on the
  domain entities.
- **Rust is the bridge, not the brain.** Keep Rust minimal and use it
  only for things that genuinely belong in the OS layer.