# Chromatic Player

A lightweight chromatic desktop music player powered by **TIDAL**.

> **Current release: v0.0.2 — Foundation Hardening.** This release
> clarifies queue ownership, adds a coordinated mock playback layer,
> wires ID-based navigation for Album and Artist pages, exposes the
> mock Search experience and makes the Rust CI reproducible by
> versioning `Cargo.lock`. It does **not** connect to TIDAL, does
> **not** play audio, and ships a mock data layer so the UI can be
> exercised end-to-end.

---

## Status

| Layer            | State                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Project skeleton | ✅ Tauri 2 + React + TypeScript + Vite                                |
| Styling          | ✅ Tailwind CSS + Chromatic Dark                                      |
| State            | ✅ Zustand stores                                                     |
| Icons            | ✅ Lucide React                                                       |
| Motion           | ✅ Motion (reserved, minimal use)                                     |
| Architecture     | ✅ Presentation → Application → Domain → Infrastructure               |
| Music provider   | ⚠️ `MusicProvider` port + `MockMusicProvider` (TidalProvider pending) |
| Playback         | ✅ Mock playback via `usePlayback` (queue + player + provider)        |
| Mock navigation  | ✅ Album / Artist pages driven by `route.id` and provider             |
| Mock search      | ✅ Loading / empty / results / error wired to `MusicProvider.search`  |
| TIDAL API        | 🚧 Reserved                                                           |
| Distribution     | 🚧 Reserved                                                           |

---

## Stack

- **Tauri 2** — desktop shell
- **Rust** — backend bridge (currently unused beyond the default scaffold)
- **React 19 + TypeScript** — UI
- **Vite** — bundler and dev server
- **Tailwind CSS 4** — styling
- **Zustand** — client state
- **Motion** — minimal motion
- **Lucide React** — iconography
- **pnpm** — package manager

---

## Architecture

Chromatic Player follows a deliberately lightweight layered architecture:

```
React UI
   ↓
usePlayback (src/hooks/usePlayback.ts)
   ↓
QueueStore + PlayerStore (src/stores/)
   ↓
MusicProvider  ←  port
   ↓
TidalProvider / MockMusicProvider  ←  adapters
```

The UI never depends on a concrete provider. The `MusicProvider`
interface is the only abstraction the application uses to talk to any
music backend. Concrete implementations live under
`src/infrastructure/*`.

```
Presentation  →  src/components, src/pages, src/app
Application   →  src/stores, src/hooks, src/app/providers, src/app/router
Domain        →  src/domain/entities, src/domain/ports, src/domain/models
Infrastructure →  src/infrastructure/tidal, src/infrastructure/mock, src/infrastructure/storage
```

More detail in [`docs/architecture/README.md`](docs/architecture/README.md).

---

## Requirements

- **Node** ≥ 20
- **pnpm** ≥ 10
- **Rust** stable + `cargo` (for `pnpm tauri dev` / `pnpm tauri build`)
- Platform build deps for Tauri:
  - Linux — `libwebkit2gtk-4.1-dev`, `libssl-dev`, `libgtk-3-dev`, `librsvg2-dev`, `libayatana-appindicator3-dev`, `pkg-config`
  - Windows — WebView2 (preinstalled on Windows 10/11), Visual Studio Build Tools

---

## Install

```bash
pnpm install
```

---

## Run

Frontend only (fastest feedback loop):

```bash
pnpm dev
```

Full desktop shell:

```bash
pnpm tauri dev
```

---

## Build

Frontend bundle:

```bash
pnpm build
```

Desktop bundle (requires Rust + platform deps):

```bash
pnpm tauri build
```

---

## Quality scripts

```bash
pnpm typecheck       # strict TypeScript check
pnpm lint            # ESLint
pnpm lint:fix        # ESLint with --fix
pnpm format          # Prettier write
pnpm format:check    # Prettier check (used in CI)
```

---

## Project structure

```text
chromatic-player/
├── .github/workflows/      CI workflows
├── docs/                   Architecture, design, decisions, roadmap
├── public/                 Static assets shipped with the frontend
├── src/
│   ├── app/                App entry, router, providers
│   ├── components/         UI components (common, layout, music, player)
│   ├── domain/             Entities + provider port
│   ├── infrastructure/     Concrete providers (mock, tidal, storage)
│   ├── features/           Future feature surfaces (auth, playback, ...)
│   ├── stores/             Zustand stores
│   ├── pages/              Route-level views
│   ├── mocks/              Mock data used by MockMusicProvider
│   ├── styles/             Global CSS + design tokens
│   ├── hooks/              Reusable hooks (usePlayback, useAsyncResource)
│   ├── types/              Cross-cutting type helpers
│   └── utils/              Pure utility functions
└── src-tauri/              Rust + Tauri configuration
```

---

## Roadmap

| Version | Theme                                                          |
| ------- | -------------------------------------------------------------- |
| v0.0.1  | Foundation                                                     |
| v0.0.2  | Foundation Hardening (current)                                 |
| v0.1.0  | Core Player (real audio, queue, library)                       |
| v0.2.0  | Desktop Integration (media keys, MPRIS, Windows Media Session) |
| v0.3.0  | Experience (lyrics, Chromatic palette, visual polish)          |
| v0.4.0+ | Providers (local files, additional backends)                   |
| v1.0.0  | Stable                                                         |

See [`docs/roadmap/README.md`](docs/roadmap/README.md) for full notes.

---

## TIDAL integration note

Chromatic Player is an **unofficial** desktop client for TIDAL.

It is built with the explicit goal of using **only the official
mechanisms exposed by TIDAL** for playback. It does not:

- bypass DRM;
- download, cache, or redistribute protected audio files;
- extract streams or circumvent provider protections;
- implement lyrics scraping or third-party API abuse.

Authentication, playback and library interactions will be implemented
through the documented public APIs in a future release.

TIDAL is a trademark of its respective owners. Use of the TIDAL name
in this project is for descriptive purposes only.

---

## License

To be defined before v1.0.0.
