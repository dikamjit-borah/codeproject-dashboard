/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CODEPROJEKT_DASHBOARD_BACKEND_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
