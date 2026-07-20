/// <reference types="vite/client" />

// Ramverksagnostiska ambient-typer som domänlagret behöver (samma som appens
// types/env.d.ts). Definieras här så att @gredor/domain kan typkontrolleras och
// testas fristående. Inkluderas inte i appens kompilering (undviker dubbletter).

declare const __APP_VERSION__: string;

type EnvironmentKey =
  | "VITE_ENV_NAME"
  | "VITE_TEST_MODE"
  | "VITE_IS_CYPRESS"
  | "VITE_GREDOR_BACKEND_BASEURL";
type EnvironmentConfig = Record<EnvironmentKey, string>;

interface ImportMeta {
  readonly env: EnvironmentConfig;
}

interface Window {
  config: EnvironmentConfig;
}
