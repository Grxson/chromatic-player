# Roadmap

This document tracks the high-level milestones for Chromatic Player.
Each milestone corresponds to a versioned release.

## v0.0.1 — Foundation

Status: **shipped**.

- Tauri 2 + React + TypeScript + Vite + Tailwind CSS baseline.
- Chromatic Dark design tokens.
- AppShell with sidebar, content area, mini player.
- Basic navigation between Home, Search, Library, Settings.
- Placeholders for Album, Artist and Fullscreen Player.
- Domain entities: Track, Album, Artist, Playlist, User.
- `MusicProvider` port.
- `MockMusicProvider` with static data.
- Zustand stores: auth, player, queue, library, settings.
- ESLint, Prettier, EditorConfig.
- Initial CI workflow (frontend + `cargo check`).

## v0.0.2 — Foundation Hardening

Status: **shipped**.

- Reproducible Rust CI checks: `Cargo.lock` versioned, system deps for
  Tauri 2 in Linux installed on the runner.
- Queue ownership clarified. `MusicProvider` no longer exposes
  `next` / `previous`; `QueueStore` owns sequencing.
- Single source of truth for `volume`: removed from `SettingsStore`,
  lives on `PlayerStore`.
- Lightweight playback layer (`usePlayback` hook) coordinates
  `PlayerStore`, `QueueStore` and the provider.
- Real ID-based navigation for Album and Artist pages.
- Provider-backed mock Search with loading / empty / results / error.
- Pages no longer import `@/mocks` directly; data comes from
  `MockMusicProvider`.
- ADR aligned with the implementation: Vite 8 native path resolver,
  `Cargo.lock` policy, queue ownership, `volume` placement.

## v0.0.3 — Visual Prototype

Status: **shipped**.

- Refined Chromatic Dark design system with brand mark and consistent
  typography rhythm.
- Album-reactive Chromatic Engine: `useChromaticTheme` writes palette
  tokens to the document root; Fullscreen Player renders the strongest
  expression of the album's atmosphere.
- Redesigned Home (hero + sectioned lists + skeleton loaders),
  Album (cover + metadata + contextual `Play album`), Search (large
  input + grouped sections), Library (tracks / albums / artists /
  playlists tabs).
- Contextual queue playback: `usePlayback.playQueue(tracks, startIndex)`
  so Next / Previous flow naturally through the source collection.
- Queue drawer with "Now playing" and "Next up" sections, jump-to,
  remove and an inline "playing" indicator.
- Mini Player redesigned: contextual current-track highlight,
  inline volume, integrated progress bar.
- Fullscreen Player: cinematic layout, mock lyrics, glow atmosphere,
  graceful "Nothing playing" empty state.
- Async state hardened: `useAsyncResource` resets to loading on key
  change; `SearchPage` uses a sequence counter so only the latest
  search wins.
- Vitest introduced: 31 tests covering QueueStore, `usePlayback`,
  `useAsyncResource` and the Search stale-handling sequence.
- CI extended with a `test` step on the frontend job.

## v0.0.4 — Visual QA & Interaction Hardening

Status: **shipped** (current release).

- **Queue cursor synchronisation**:
  - `playQueueIndex(index)` now calls `QueueStore.jumpTo(index)` before
    preparing the track. Next / Previous start from the picked row.
  - The internal `playTrackInternal` helper uses the public
    `enqueue` + `jumpTo` actions and never edits `useQueueStore` internals
    directly.
- **Current-track removal**:
  - `usePlayback.removeFromQueue(index)` coordinates playback. Removing
    a non-current track leaves playback untouched. Removing the
    current track advances to the next valid track, falls back to the
    previous, or resets to idle when the queue is empty.
  - `QueueDrawer` calls `playback.removeFromQueue(index)` and never
    `useQueueStore.removeAt` directly.
- **Playback failure reconciliation**:
  - `PlayerStore` gains an `error` string. Every public `usePlayback`
    action transitions through `loading` before resolving to
    `playing` / `paused` / `error`.
  - On failure the previous player snapshot is restored, the requested
    track stays visible and a short message lands in `PlayerStore.error`.
  - `seek` clamps to `[0, duration]`; `setVolume` clamps to `[0, 1]`
    before reaching the provider.
- **Search stale-result handling** rewritten: the test mounts the
  real `SearchPage` against a controlled `MusicProvider` so removing
  the production guard breaks the test.
- **Motion preference**:
  - `useMotionPreference` combines `prefers-reduced-motion` with
    `settings.animations`. The Queue drawer, Fullscreen Player and
    PlayingBars respect the preference.
- **Mute memory**:
  - `useMuteMemory` remembers the previous volume across mute
    toggles so `M` no longer falls back to `0.8` blindly.
  - The Mini Player mute action and the `M` shortcut share the same hook.
- **Keyboard shortcuts** (`usePlayerShortcuts`):
  - `Space` toggles play / pause.
  - `ArrowLeft` / `ArrowRight` seek ±5s with `[0, duration]` clamping.
  - `M` toggles mute (uses `useMuteMemory`).
  - `F` toggles fullscreen.
  - `Q` toggles the Queue drawer.
  - `Escape` closes the queue first, then fullscreen.
  - Shortcuts are ignored when focus is inside an editable control.
- **Fullscreen remembers the previous route** so Minimize / Escape
  return to the user's page instead of always Home.
- **Current-track styling** in the Mini Player reflects playback
  status (`playing` uses accent, `paused` uses primary text, `error`
  uses danger, `loading` uses accent at 60 %).
- **Dead code removal**: the `void Pause; void Play; …` imports hack
  is gone from `MiniPlayer`.
- **Tests**: 63 Vitest tests covering QueueStore, `usePlayback`,
  provider failures, keyboard shortcuts, mute memory and motion
  preference.

Explicitly **not** included in v0.0.4:

- Real TIDAL API integration, OAuth or authentication.
- Real audio playback.
- Persistence, SQLite.
- Lyrics (only mock placeholder).
- Discord Rich Presence, MPRIS, Windows Media Session.
- Jellyfin, local music, plugins, visualizers.
- Real chromatic colour extraction from artwork.

## Next phase

The next release will be defined in a follow-up task once the
foundation is reviewed. Candidates are:

- **v0.0.5 — Visual prototype iteration** based on review feedback.
- **v0.1.0-alpha.1 — TIDAL Authentication & Catalog** with the
  real `TidalProvider`.

## v0.1.0 — Core Player (planned)

- Real audio engine.
- Queue, shuffle, repeat.
- Library: liked tracks, saved albums, followed artists, playlists.
- Realistic search via the TIDAL API.
- Persistent settings.
- TIDAL authentication flow.

## v0.2.0 — Desktop Integration (planned)

- Media keys (Linux, Windows).
- MPRIS on Linux.
- Windows Media Session.
- Taskbar / dock metadata.
- Discord Rich Presence (optional).

## v0.3.0 — Experience (planned)

- Real lyrics.
- Chromatic palette extraction from artwork.
- Fullscreen player polish.
- Replayable queue and history.

## v0.4.0+ — Providers (planned)

- Local music library.
- Additional backends (Spotify, Jellyfin).
- Provider abstraction proven with multiple live implementations.

## v1.0.0 — Stable (planned)

- Stable API surface.
- Polished onboarding.
- Signed releases for Linux and Windows.
- Public documentation.