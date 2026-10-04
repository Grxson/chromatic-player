# Draft: TIDAL third-party Player SDK support question

**Status: draft only; not submitted.** Do not include client identifiers,
tokens, account data, or other credentials in a public post.

Hello TIDAL Developer team,

We are building Chromatic Player, a third-party desktop application using the
public TIDAL Auth SDK and catalog API. Before implementing any playback, we want
to confirm the supported integration path for third-party applications.

1. Is `@tidal-music/player` supported for third-party applications, including
   desktop clients built with Tauri and WebView2?
2. What public, authorized `EventSender` implementation should third-party Web
   SDK clients use with the Player SDK?
3. The official `@tidal-music/event-producer` documentation describes the
   package as intended for internal TIDAL use. Is there a supported public
   alternative for third-party clients?
4. Is full-track playback available to ordinary Third Party applications, or
   does it require a higher access tier, partnership approval, or allowlisting?
5. Once an application's access tier is enabled, are the `playback` and
   `entitlements.read` scopes sufficient, or are other permissions/processes
   required?
6. Is Tauri/WebView2 a supported environment for protected playback with the
   Player SDK? In particular, what EME/CDM, codec, secure-context, and event
   reporting constraints should an application validate?

We will not extract media URLs, call private endpoints, or bypass DRM. Please
point us to the current public documentation and any required approval process.

Thank you.
