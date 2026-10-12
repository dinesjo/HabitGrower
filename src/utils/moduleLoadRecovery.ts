const reloadKey = "habitgrower:module-reload-at";
const reloadCooldown = 5 * 60 * 1000;

// Browser wording differs; keep this limited to asset loading, not errors thrown
// by Firebase, a route action, or the code inside a successfully loaded module.
export function isModuleLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|not a valid javascript mime type for module script|unable to preload css for/i.test(message);
}

type RecoveryBrowser = Pick<Window, "addEventListener" | "removeEventListener" | "sessionStorage" | "location" | "navigator">;

export function installModuleLoadRecovery(browser: RecoveryBrowser = window, now = Date.now): () => void {
  let reloadRequested = false;
  const onPreloadError = (event: Event) => {
    const error = (event as Event & { payload?: unknown }).payload;
    if (!isModuleLoadError(error) || reloadRequested || browser.navigator.onLine === false) return;

    // Persist across the refresh, including a failed fresh deployment. If Safari
    // blocks storage, leave the explicit Reload button available instead of
    // risking a refresh loop. A later deployment can recover in the same tab.
    try {
      const timestamp = now();
      const previous = Number(browser.sessionStorage.getItem(reloadKey));
      if (Number.isFinite(previous) && previous > 0 && timestamp - previous < reloadCooldown) return;
      browser.sessionStorage.setItem(reloadKey, String(timestamp));
    } catch {
      return;
    }

    reloadRequested = true;
    browser.location.reload();
    // Keep Vite's rejection intact so the error boundary still renders if the
    // refresh cannot complete. Suppressing it would resolve the import as undefined.
  };

  browser.addEventListener("vite:preloadError", onPreloadError);
  return () => browser.removeEventListener("vite:preloadError", onPreloadError);
}
