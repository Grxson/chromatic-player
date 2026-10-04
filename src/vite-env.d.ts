/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MUSIC_SOURCE?: "mock" | "tidal";
  readonly VITE_TIDAL_CLIENT_ID?: string;
  readonly VITE_TIDAL_REDIRECT_URI?: string;
  readonly VITE_TIDAL_SCOPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
