import { isLocalMode } from "./mode";
import type { AppBackend } from "./types";

// Firebase modules are only evaluated when the real backend is selected.
let backend: Promise<AppBackend> | undefined;
export function getBackend(): Promise<AppBackend> {
  return backend ??= isLocalMode
    ? import("./localBackend").then(({ createLocalBackend }) => createLocalBackend(window.localStorage))
    : import("./firebaseBackend").then(({ firebaseBackend }) => firebaseBackend);
}
