# TIDAL development setup

1. Create/use an application in the TIDAL Developer Portal and confirm that the
   application is approved for the current Developer Platform API and user
   authorization-code flow.
2. Copy its **public Client ID**. Do not create or distribute a client secret
   with the desktop app.
3. Register an HTTPS redirect URI supported by the current TIDAL portal. The
   Auth SDK's official authorization-code example requires a secure context
   and a valid HTTPS redirect URI. Do not register `chromatic-player://` as the
   TIDAL redirect based on assumption.
4. Host/operate an HTTPS callback page at that exact URI. After TIDAL returns
   the authorization response, it must hand the query parameters to the app as
   `chromatic-player://oauth/callback?code=…&state=…`. This bridge is
   application/deployment configuration, not included here; validate with the
   portal and TIDAL before using it for real accounts.
5. Copy `.env.example` to `.env.local` and set:

   ```text
   VITE_MUSIC_SOURCE=tidal
   VITE_TIDAL_CLIENT_ID=<public client id>
   VITE_TIDAL_REDIRECT_URI=<registered HTTPS redirect URI>
   VITE_TIDAL_SCOPES=
   ```

   The current official SDK authorization-code example requests no explicit
   scopes. Leave the value empty unless the current Developer Portal/API docs
   require specific scopes for the application; use least privilege.

6. Run `pnpm install --frozen-lockfile`, then `pnpm tauri dev`. Open Settings and
   choose **Connect TIDAL**. The TIDAL login URL opens in the system browser.
7. Verify real login, session restore, search, one album, one artist and logout
   without changing the user's collection.

For offline development set `VITE_MUSIC_SOURCE=mock`. No TIDAL configuration is
needed for mock mode.

## Callback contract

The application handles only `chromatic-player://oauth/callback`, verifies the
stored OAuth `state`, and delegates the PKCE code exchange to `@tidal-music/auth`.
Tauri registers the `chromatic-player` scheme on desktop. TIDAL is configured
with the HTTPS URI, not the custom URI. No callback domain is provided by this
repository, so the real hand-off is **not verified** until a deployment owns
and tests that HTTPS bridge on both Windows and Linux.
