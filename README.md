# Chromatic Player

A lightweight chromatic desktop music player powered by **TIDAL**.

> **Current release: v0.0.4 — Visual QA & Interaction Hardening.**
> This release is a hardening pass on top of v0.0.3: queue cursor and
> current-track removal are now consistent, playback failure paths
> restore the previous state, the Fullscreen browser returns to the
> previous page, the Search stale-result guard is exercised against the
> real page, mute remembers the previous volume, motion respects
> `prefers-reduced-motion` and `settings.animations`, and the desktop
> keyboard shortcuts are wired through a single hook. It does **not**
> connect to TIDAL, does **not** play audio, and still ships a mock
> data layer.

---

## Status

| Layer             | State                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Project skeleton  | ✅ Tauri 2 + React + TypeScript + Vite                                |
| Styling           | ✅ Tailwind CSS + Chromatic Dark                                      |
| State             | ✅ Zustand stores                                                     |
| Icons             | ✅ Lucide React                                                       |
| Motion            | ✅ Motion (respects `prefers-reduced-motion` + `settings.animations`) |
| Architecture      | ✅ Presentation → Application → Domain → Infrastructure               |
| Music provider    | ⚠️ `MusicProvider` port + `MockMusicProvider` (TidalProvider pending) |
| Playback          | ✅ `usePlayback` (contextual queue, status lifecycle, rollback)       |
| Chromatic Engine  | ✅ Album-reactive palette mapped to CSS custom properties             |
| Mock navigation   | ✅ Album / Artist pages driven by `route.id` and provider             |
| Mock search       | ✅ Provider-backed, stale-result safe, real-page tests                |
| Queue drawer      | ✅ Now playing + next-up, remove / clear / jump / focus restoration   |
| Library           | ✅ Liked tracks, saved albums, followed artists, playlists            |
| Mini Player       | ✅ Status-aware current-track styling                                 |
| Fullscreen Player | ✅ Status-aware, chromatically reactive, mock lyrics                  |
| Keyboard          | ✅ Space, Arrow keys, M (mute), F (fullscreen), Q (queue), Escape     |
| TIDAL API         | 🚧 Reserved                                                           |
| Distribution      | 🚧 Reserved                                                           |

---

## Stack

- **Tauri 2** — desktop shell
- **Rust** — backend bridge (currently unused beyond the default scaffold)
- **React 19 + TypeScript** — UI
- **Vite** — bundler and dev server
- **Tailwind CSS 4** — styling
- **Zustand** — client state
- **Motion** — minimal motion (respects reduced-motion)
- **Lucide React** — iconography
- **Vitest** — unit / integration tests
- **pnpm** — package manager

---

## Architecture

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

`usePlayback` is the single coordination layer. Components must never
call `MusicProvider.play` directly, never mutate the cursor via
`useQueueStore.setState`, and never mutate `PlayerStore.currentTrack`
on their own. They go through the hook so the three layers stay
synchronised even when a provider call fails.

For the full architecture overview see
[`docs/architecture/README.md`](docs/architecture/README.md).

---

## Requirements

- **Node** ≥ 20 (CI uses 22)
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
pnpm test            # Vitest (used in CI)
pnpm test:watch      # Vitest in watch mode
```

---

## Keyboard shortcuts

| Key          | Action                                           |
| ------------ | ------------------------------------------------ |
| `Space`      | Toggle play / pause                              |
| `ArrowRight` | Seek +5 seconds                                  |
| `ArrowLeft`  | Seek -5 seconds (clamped to 0)                   |
| `M`          | Toggle mute (remembers previous volume)          |
| `F`          | Toggle fullscreen player                         |
| `Q`          | Toggle queue drawer                              |
| `Escape`     | Close queue → otherwise close fullscreen → no-op |

Shortcuts are ignored while the focus is inside an `input`,
`textarea`, `select` or `contenteditable` element (typing in Search
does not trigger transport actions).

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
│   ├── features/           Chromatic Engine, queue drawer, library tabs
│   ├── stores/             Zustand stores
│   ├── pages/              Route-level views
│   ├── mocks/              Mock data + chromatic palettes + lyrics
│   ├── styles/             Global CSS + design tokens
│   ├── hooks/              usePlayback, useAsyncResource, usePlayerShortcuts, …
│   ├── types/              Cross-cutting type helpers
│   ├── utils/              Pure utility functions
│   └── test/               Vitest tests
└── src-tauri/              Rust + Tauri configuration
```

---

## Roadmap

| Version | Theme                                                          |
| ------- | -------------------------------------------------------------- |
| v0.0.1  | Foundation                                                     |
| v0.0.2  | Foundation Hardening                                           |
| v0.0.3  | Visual Prototype                                               |
| v0.0.4  | Visual QA & Interaction Hardening (current)                    |
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
