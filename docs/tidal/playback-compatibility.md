# TIDAL Player compatibility research

**Research date:** 2026-10-03. No Player package was installed and no playback
request, stream/manifest URL, DRM workflow, or WebView playback was exercised.
This document records an external integration blocker; it is not evidence of
Chromatic playback support.

## Verified from official material

- TIDAL publishes the official `@tidal-music/player` package (version **0.20.1**
  was observed during research).
- The Player SDK accepts a credentials provider and requires an event sender.
  Its documented `MediaProduct` includes `productId`, `productType`, `sourceId`,
  `sourceType`, and optional reference/share/extras fields.
- The TIDAL Player specification describes reporting responsibilities including
  PlayLog, Streaming Metrics, progress events, and streaming-privilege handling.
- TIDAL's official `@tidal-music/event-producer` README identifies that package
  as intended for internal TIDAL use. It is therefore **not** being adopted as a
  third-party production dependency.
- The Developer Portal exposes the `playback` and `entitlements.read` scope
  identifiers. Their presence in the portal does not prove that this app has an
  approved playback grant or account entitlement.
- Chromatic's TIDAL metadata/catalog integration works independently of the
  playback backend. TIDAL mode still composes `MockPlaybackBackend`.

## Blocked / not verified

- **BLOCKED — third-party EventSender:** no publicly documented, authorized
  EventSender implementation for third-party Web SDK applications has been
  established. Do not substitute a no-op sender, reverse-engineered endpoint,
  or internal Event Producer transport.
- **BLOCKED — full playback access tier:** access approval for ordinary
  third-party applications is not confirmed. Full-track playback in Chromatic
  has not been implemented or verified.
- **NOT VERIFIED — scope grant:** whether `playback` and `entitlements.read` can
  be granted to this app, and whether they are sufficient for playback, needs
  written TIDAL confirmation. They are not silently added to local scopes.
- **NOT VERIFIED — Tauri/WebView2:** EME/Widevine/CDM support, codecs, protected
  playback, event reporting, and subscription behavior have not been exercised
  in packaged Tauri/WebView2.
- **NOT VERIFIED — full-length audio:** no full-length track was played. Search,
  catalogue metadata, a resolving SDK promise, or a preview cannot be reported
  as full playback.

## Current application behavior

```text
TIDAL metadata/catalog = real
Playback backend = mock
TIDAL audio = not implemented
```

No Player SDK dependency is installed. No manifests, stream URLs, private API,
legacy `/v1` endpoint, DRM bypass, or protected-media cache is used.

## Required external clarification

Before installing the Player SDK or requesting playback scopes, obtain current
written guidance from TIDAL on third-party access, the event sender, eligible
access tiers, and supported WebView environments. A draft support question is
saved in [`playback-support-question.md`](./playback-support-question.md); it
has not been submitted and contains no app credentials.

If TIDAL confirms a supported route, first implement an isolated one-track
compatibility spike using only the official Player SDK, the existing Auth SDK
credentials provider, and the authorized event sender. Require audible audio
in packaged Tauri/WebView2 before expanding playback features. Otherwise keep
playback mock and record the external blocker; do not work around TIDAL's
requirements.

## Sources consulted

Official sources only:

- [TIDAL Web SDK](https://github.com/tidal-music/tidal-sdk-web)
- [`@tidal-music/player` README](https://github.com/tidal-music/tidal-sdk-web/blob/main/packages/player/README.md)
- [`@tidal-music/player` package metadata](https://github.com/tidal-music/tidal-sdk-web/blob/main/packages/player/package.json)
- [`@tidal-music/event-producer` README](https://github.com/tidal-music/tidal-sdk-web/tree/main/packages/event-producer)
- [TIDAL Player specification](https://github.com/tidal-music/tidal-sdk/blob/main/Player.md)
- [TIDAL Auth SDK documentation](https://tidal-music.github.io/tidal-sdk-web/modules/_tidal-music_auth.html)
- [Tauri 2 documentation](https://v2.tauri.app/)

No live compatibility or playback tests were performed.
