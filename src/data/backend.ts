import { isLocalMode } from "./mode";
import type { AppBackend } from "./types";

// Firebase modules are only evaluated when the real backend is selected.
let backend: Promise<AppBackend> | undefined;
export function getBackend(): Promise<AppBackend> {
  return backend ??= isLocalMode
    ? import("./localBackend").then(({ createLocalBackend }) => {
      const params = new URLSearchParams(window.location.search);
      return createLocalBackend(window.localStorage, undefined, {
        delayMs: Math.min(10000, Math.max(0, Number(params.get("registrationDelay")) || 0)),
        fail: params.get("registrationFail") === "true",
        failOnce: params.get("registrationFail") === "once",
      });
    })
    : import("./firebaseBackend").then(({ firebaseBackend }) => firebaseBackend);
}
