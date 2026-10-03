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
usePlayback.playTrack(track) / .next() / .seek(position) / .setVolume(v)
   ↓
QueueStore      ← cursor + tracks
Provider        ← single-track transport
PlayerStore     ← observable state for the UI
```

`usePlayback` is the only place in the application that mutates all
three together. Components never reach into the provider directly and
they never compute next-track indexes themselves.

## Folder layout

```text
src/
├── app/                 # Composition root (App, router, providers)
├── components/
│   ├── common/          # Buttons, sliders, toasts, etc.
│   ├── layout/          # AppShell, Sidebar, Header, Content
│   ├── music/           # Artwork, cards, rows
│   └── player/          # MiniPlayer, controls, progress, volume
├── domain/
│   ├── entities/        # Track, Album, Artist, Playlist, User
│   ├── models/          # Composite value types
│   └── ports/           # MusicProvider + supporting contracts
├── infrastructure/
│   ├── mock/            # MockMusicProvider
│   ├── tidal/           # TidalProvider (future)
│   └── storage/         # Persistent settings (future)
├── stores/              # auth, player, queue, library, settings
├── hooks/               # usePlayback, useAsyncResource
├── pages/               # Route-level views
├── mocks/               # Static mock data (only used by MockMusicProvider)
├── styles/              # Global CSS + design tokens
├── types/               # Cross-cutting type helpers
└── utils/               # Pure utility functions
```

## Principles

- **Domain stays pure.** No TIDAL types inside `src/domain/`.
- **UI never talks to providers directly.** Always through `usePlayback`.
- **No premature abstractions.** Add a port when there are at least two
  implementations or a real need to test in isolation.
- **Rust is the bridge, not the brain.** Keep Rust minimal and use it
  only for things that genuinely belong in the OS layer.