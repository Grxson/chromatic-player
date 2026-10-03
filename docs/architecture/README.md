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

Everything that renders UI. Lives under `src/components/`, `src/pages/`
and `src/app/`. Components must be free of business logic. They consume
stores via hooks and call the application layer.

### Application

Coordination layer. Contains Zustand stores (`src/stores/`), the router
context (`src/app/router/`), the provider context
(`src/app/providers/`) and cross-cutting hooks (`src/hooks/`).
Translates user intent into provider calls and keeps the UI reactive.

### Domain

Pure types and contracts. The only dependencies allowed are from this
layer itself. The `MusicProvider` interface is the sole seam between the
application and any concrete music backend.

### Infrastructure

Concrete adapters that implement the domain ports. Today this is
`MockMusicProvider`. Future providers (TidalProvider, local files,
etc.) will live here as siblings and never leak into the UI.

### Features

Feature-shaped surfaces that cut across the layers: the mock Chromatic
Engine, the Queue drawer and the Library tabs. They own their UI and
state but never bypass the application or domain layers.

## Provider seam

```
React UI
   ↓
usePlayback hook (src/hooks/usePlayback.ts)
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
is active and makes future migrations straightforward.

## Playback coordination

Single track playback (play / pause / resume / seek / volume) is
delegated to the provider. Queue navigation (next / previous /
jumpTo / enqueue / clear) is owned by `QueueStore`. Both are wired
together by `usePlayback` so the UI calls one method and the rest of
the system stays consistent.

```
UI component
   ↓
usePlayback.playTrack(track) / .playQueue(tracks, i) / .next() / .seek(position) / .setVolume(v)
   ↓
QueueStore      ← cursor + tracks
Provider        ← single-track transport
PlayerStore     ← observable state for the UI
```

`usePlayback` is the only place in the application that mutates all
three together. Components never reach into the provider directly and
they never compute next-track indexes themselves.

### Status lifecycle

`PlayerStore.status` moves through the following states:

```
idle ─► loading ─► playing
                  ▲
                  └──► paused ─► playing
                              ▲
                              └──► error
```

Every `usePlayback` action transitions to `loading` before calling the
provider, then to `playing` / `paused` / `error` based on the outcome.
On `error`, the previous track stays in the store so the UI keeps its
context; only the status flips.

## Chromatic Engine

`useChromaticTheme` (in `src/features/chromatic/`) is a thin hook that
maps the current `albumId` to a `ChromaticPalette` and writes the
palette to the document root as CSS custom properties
(`--chromatic-hue`, `--album-dominant`, `--album-accent`, `--chromatic-glow-primary`, …).
Today the palette table lives in `src/features/chromatic/chromatic.mock.ts`.
When real colour extraction arrives, only that file changes.

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
├── hooks/               # usePlayback, useAsyncResource, useRouter, useChromaticTheme
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
- **Visual metadata lives in `src/features/chromatic/`, not on entities.**
- **No premature abstractions.** Add a port when there are at least two
  implementations or a real need to test in isolation.
- **Rust is the bridge, not the brain.** Keep Rust minimal and use it
  only for things that genuinely belong in the OS layer.