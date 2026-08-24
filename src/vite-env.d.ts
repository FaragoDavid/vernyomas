/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_MOCK_READINGS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
