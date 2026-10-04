# Catalogue adapter

`TidalCatalogProvider` implements the provider-neutral `MusicCatalogProvider`
port using `@tidal-music/api` 0.49.0 `createAPIClient(credentialsProvider)`.
That official client defaults to `https://openapi.tidal.com/v2/`, attaches
credentials from the Auth SDK on each request, and has retry handling for
read-only methods. The adapter only calls generated, typed GET operations:

- `/searchResults`
- `/tracks/{id}`
- `/albums/{id}` and included `items`
- `/artists/{id}` and included `albums`
- `/playlists/{id}` and included `items`

JSON:API resources are mapped by `resources.mapper.ts` into Chromatic's own
`Track`, `Album`, `Artist`, and `Playlist` entities. IDs are strings and
artwork URLs are read only from the official `artworks.files[].href` response;
no CDN URL is reconstructed. Missing optional fields receive safe domain
fallbacks. Duration is parsed from the API's ISO 8601 duration.

The adapter has no write methods and does not call any legacy `/v1` or private
endpoint. Search with an empty query returns an empty domain result (it is not
used to fabricate TIDAL Home content). TIDAL-mode Home directs the user to
Search or account Settings. Library remains local in alpha.1.

The official API SDK handles retry behavior for safe methods, including
rate-limited/transient responses. Chromatic adds no second retry loop. API
errors are intentionally surfaced as a concise catalogue-unavailable error;
more precise status mapping can follow real API observations.
