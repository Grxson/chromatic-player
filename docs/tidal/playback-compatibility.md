# TIDAL Player compatibility research (no playback implementation)

**Research date:** 2026-10-03. No player package was installed and no playback
request, stream/manifest URL, or DRM workflow was exercised.

## Official package and requirements

- The TIDAL SDK for Web repository publishes `@tidal-music/player`; current
  package metadata inspected at research time reports **0.20.1**.
- The SDK's official `Player.md` describes a Playback Engine and an Offline
  Engine. It explicitly says the Player module is the only recommended way for
  an app to provide TIDAL playback/offlining.
- Initialization requires a TIDAL `CredentialsProvider` and an event sender.
  The Player reports asynchronous state/transitions/errors on its buses. Its
  specification requires PlayLog, Streaming Metrics, progress events and
  streaming-privilege handling.
- Package metadata lists `shaka-player` 5.2.12 as a development dependency;
  this is evidence of the web engine dependency, not a claim that every Tauri
  WebView supports every TIDAL codec/DRM configuration.
- The Player spec describes online streaming and protected media (CMAF/fMP4,
  DASH/HLS, CENC-CBCS and Widevine or FairPlay). Preview behavior and public
  app entitlements were not established by the reviewed material; verify with
  TIDAL before designing preview support.
- Player initialization expects the Auth SDK's credentials provider. Auth
  credentials must be requested through that provider, never copied to UI.

## Tauri/WebView risk assessment

- **Windows / WebView2:** Tauri uses WebView2 on Windows. This research did not
  verify TIDAL Player's EME, Widevine CDM, protected media, codecs, event
  reporting, or subscription behavior in WebView2. Do not infer compatibility
  from desktop Edge or ordinary HTML media support.
- **Linux / WebKitGTK:** Tauri uses WebKitGTK. This research did not verify
  EME/Widevine availability, proprietary CDM deployment, codec support, or
  protected media behavior on supported Linux distributions. This is an
  explicit high-risk compatibility unknown.
- **CSP/browser capabilities:** Player media and license resource origins,
  MSE/EME requirements, and any platform-specific TIDAL allowlisting need an
  official integration guide and runtime validation before changing CSP.
- **Events/metrics:** the Player's event sender and the required PlayLog,
  Streaming Metrics, progress and streaming privileges are part of integration,
  not optional UI details. No event transport is implemented in alpha.1.
- **Offline:** the official Player includes an Offline Engine. Chromatic must
  not expose offline functionality or cache protected media in alpha.2 unless
  separately authorized, designed and tested against TIDAL's guidelines.

## Recommendation for v0.1.0-alpha.2

1. Obtain written/current TIDAL Developer Platform guidance for public desktop
   clients, preview/full playback entitlements, mandatory event reporting and
   supported WebView environments.
2. Build an isolated compatibility spike using only `@tidal-music/player`,
   the existing Auth SDK credentials provider and the required official event
   sender. Do not parse manifests or extract media URLs.
3. Start with one online track, play/pause/seek, state/error/event reporting;
   do not initialize or expose Offline Engine features unless TIDAL requires
   them and grants the necessary product capability.
4. Test packaged Tauri builds on Windows WebView2 and at least one target Linux
   WebKitGTK distribution. Record EME/CDM and codec results separately; a Vite
   browser preview is not evidence for packaged WebViews.
5. Keep the feature behind a runtime flag and retain `MockPlaybackBackend`
   until TIDAL confirms platform and account eligibility. Do not replace the
   playback port or create a release based on compile-time compatibility alone.

## Sources consulted

Official sources only:

- [TIDAL Web SDK README](https://github.com/tidal-music/tidal-sdk-web)
- [`@tidal-music/player` README](https://github.com/tidal-music/tidal-sdk-web/blob/main/packages/player/README.md)
- [`@tidal-music/player` package metadata](https://github.com/tidal-music/tidal-sdk-web/blob/main/packages/player/package.json)
- [TIDAL Player specification](https://github.com/tidal-music/tidal-sdk/blob/main/Player.md)
- [TIDAL Auth SDK documentation](https://tidal-music.github.io/tidal-sdk-web/modules/_tidal-music_auth.html)
- [Tauri 2 documentation](https://v2.tauri.app/)

No live compatibility tests were performed.
