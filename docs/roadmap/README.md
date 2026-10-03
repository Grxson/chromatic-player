# Roadmap

This document tracks the high-level milestones for Chromatic Player.
Each milestone corresponds to a versioned release.

## v0.0.x — Foundation

Status: **in progress** (current: v0.0.1)

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
- Initial CI workflow.
- README, architecture, design and roadmap docs.

Explicitly **not** included in v0.0.x:

- Real TIDAL API integration, OAuth or authentication.
- Real audio playback.
- Lyrics.
- Discord Rich Presence, MPRIS, Windows Media Session.
- Jellyfin, local music, SQLite, plugins, visualizers.
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