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
context (`src/app/router/`) and React providers
(`src/app/providers/`). Translates user intent into provider calls and
keeps the UI reactive.

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
Application (stores / hooks)
   ↓
MusicProvider  ←  port
   ↓
TidalProvider / MockMusicProvider  ←  adapters
```

The application never imports from `src/infrastructure/tidal` or
`src/infrastructure/mock` directly except through provider composition
in `src/app/providers/`. This keeps the UI agnostic about which backend
is active and makes future migrations straightforward.

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
├── pages/               # Route-level views
├── hooks/               # Cross-cutting React hooks
├── mocks/               # Static mock data
├── styles/              # Global CSS + design tokens
├── types/               # Cross-cutting type helpers
└── utils/               # Pure utility functions
```

## Principles

- **Domain stays pure.** No TIDAL types inside `src/domain/`.
- **UI never talks to providers directly.** Always through stores.
- **No premature abstractions.** Add a port when there are at least two
  implementations or a real need to test in isolation.
- **Rust is the bridge, not the brain.** Keep Rust minimal and use it
  only for things that genuinely belong in the OS layer.