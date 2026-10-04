# Authentication decisions

## Official SDK and flow

`@tidal-music/auth` 1.6.2 is used for initialization, authorization URL
creation, PKCE S256 challenge generation, code exchange, credential refresh,
and logout. User credentials are entered only on TIDAL's official login site.
Chromatic does not receive passwords or embed a client secret. The SDK's
`credentialsProvider.getCredentials()` is called when checking the session; raw
access/refresh tokens are not copied to React state, Zustand, logs, or app code.

TIDAL's published SDK example documents an Authorization Code redirect and
requires a secure context plus a valid HTTPS redirect URI. The SDK does not
provide a desktop protocol callback itself. Chromatic validates a one-time
`state` value and callback scheme/host/path before calling `finalizeLogin`.

### Desktop callback options (provisional)

- **Loopback (`http://127.0.0.1:<port>/callback`)**: suitable in principle for a
  native application and avoids a hosted bridge, but TIDAL portal acceptance
  and compatibility with the current Auth SDK's secure-context/HTTPS constraint
  are not established by the official material checked for this integration.
  Do not use until the registered app and live flow confirm support.
- **HTTPS callback + application bridge**: matches the SDK example's stated
  HTTPS redirect requirement. A separately operated HTTPS endpoint would need
  to validate/forward only the expected OAuth response to
  `chromatic-player://oauth/callback`. No bridge is included in this repository;
  portal acceptance, hosting, and the end-to-end exchange remain unverified.
- **Custom URI directly (`chromatic-player://oauth/callback`)**: Tauri's official
  deep-link plugin supports desktop custom schemes, but that does not establish
  that TIDAL accepts this URI as a registered redirect. Direct use is not
  selected unless the Developer Portal and a real authorization confirm it.

The current Tauri registration is only a callback candidate. Tauri documents
that desktop deep links can arrive as arguments to a new process and recommends
a Single Instance integration to route links to an already-running window.
This repository does not yet configure that plugin, so second-instance callback
handling is also unverified. Validate Windows and Linux behavior before
claiming the desktop login flow works. Do not represent the current flow as
production-ready until TIDAL redirect acceptance and the complete Tauri callback
are verified live.

The official SDK's current authorization-code example does not set scopes.
Chromatic's optional `VITE_TIDAL_SCOPES` defaults to none. Set only scopes that
are confirmed as necessary by the current Developer Portal/API documentation.
No legacy scope names are hardcoded.

**Live configuration is blocked** until an application owner confirms the
accepted redirect URI and minimum scopes in the TIDAL Developer Portal and
provides a public Client ID plus a test account. Never provide a password,
client secret, access token, or refresh token to Chromatic's maintainers.

## Session persistence

The SDK default storage path encrypts its credential payload in browser storage
using Web Crypto (AES-CTR and PBKDF2/AES-KW wrapping). The SDK itself warns that
this is not high-assurance secret storage. Chromatic uses this one default
storage path for alpha.1 rather than layering a second token store on top.
Tokens are not stored plaintext by Chromatic or in Zustand. This is not an OS
credential vault and is a documented hardening limitation for a later review.

Tauri Stronghold is not added: the SDK's custom `StorageAdapter` stores the
provided value as-is, and safely deriving/unlocking Stronghold without a
hardcoded vault password would require a deliberate native credential/key
strategy. A hardcoded password would not improve security.

## Observable state

`useAuthStore` contains only UI state (`initializing`, `unauthenticated`,
`authenticating`, `authenticated`, `error`), optional user ID and a safe
user-facing error. Auth implementation and credentials stay under
`src/infrastructure/tidal/auth/`.
