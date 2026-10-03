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

Status: **in progress** (current release).

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

Explicitly **not** included in v0.0.2:

- Real TIDAL API integration, OAuth or authentication.
- Real audio playback.
- Persistence, SQLite, settings migration.
- Lyrics.
- Discord Rich Presence, MPRIS, Windows Media Session.
- Jellyfin, local music, plugins, visualizers.
- Real chromatic colour extraction.

## v0.1.0 — Core Player

- Real audio engine.
- Queue, shuffle, repeat.
- Library: liked tracks, saved albums, followed artists, playlists.
- Realistic search via the TIDAL API.
- Persistent settings.
- TIDAL authentication flow.

## v0.2.0 — Desktop Integration

- Media keys (Linux, Windows).
- MPRIS on Linux.
- Windows Media Session.
- Taskbar / dock metadata.
- Discord Rich Presence (optional).

## v0.3.0 — Experience

- Real lyrics.
- Chromatic palette extraction from artwork.
- Fullscreen player polish.
- Replayable queue and history.

## v0.4.0+ — Providers

- Local music library.
- Additional backends (Spotify, Jellyfin).
- Provider abstraction proven with multiple live implementations.

## v1.0.0 — Stable

- Stable API surface.
- Polished onboarding.
- Signed releases for Linux and Windows.
- Public documentation.