// The keys the platform puts in window._env_. This app has no sign-in and no
// external upstream, and declares no configurations.env entries, so none yet.
// The todo-api address is a pod env var for nginx, never a browser key.
type Env = Record<string, never>;

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;
