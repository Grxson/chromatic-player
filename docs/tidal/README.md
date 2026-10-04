# TIDAL integration (alpha.1 foundation)

This phase uses only TIDAL's official Web SDK and Developer Platform OpenAPI v2.
The catalogue is read-only. Playback is still `MockMusicProvider`; selecting a
TIDAL track updates Chromatic's queue/player UI but produces no audio.

- [Setup](./setup.md)
- [Authentication and storage](./auth.md)
- [Catalogue adapter](./catalog.md)
- [Playback SDK compatibility research](./playback-compatibility.md)

No `api.tidal.com/v1` or private/reverse-engineered endpoint is used. No TIDAL
collection writes, real lyrics, stream URL handling, or TIDAL Player dependency
is included.

> **Live integration is not release-verified.** A TIDAL Client ID, registered
> HTTPS redirect, an HTTPS callback bridge to `chromatic-player://oauth/callback`,
> and a real account smoke test are still required. The callback bridge is not
> hosted or shipped by this repository.
