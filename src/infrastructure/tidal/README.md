# TIDAL infrastructure

Reserved for the future `TidalProvider` and supporting infrastructure
(OAuth, REST adapters, response mappers, playback helpers). This
foundation release does **not** implement any TIDAL interaction.

## Layout

- `api/` — HTTP clients for the public TIDAL endpoints.
- `auth/` — OAuth, token refresh, secure storage of credentials.
- `playback/` — playback manifests and stream resolution.
- `adapters/` — domain ↔ TIDAL response translation.
- `mappers/` — narrow field mappers used by the adapters.

The UI must never import from this folder. Access happens exclusively
through `src/app/providers/MusicProviderProvider.tsx`.
