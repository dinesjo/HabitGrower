import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const directory = await mkdtemp(join(tmpdir(), "habitgrower-recovery-test-"));
after(() => rm(directory, { recursive: true, force: true }));
const source = await readFile(new URL("../src/utils/moduleLoadRecovery.ts", import.meta.url), "utf8");
await writeFile(join(directory, "recovery.mjs"), ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText);
const { isModuleLoadError, installModuleLoadRecovery } = await import(pathToFileURL(join(directory, "recovery.mjs")));
const safariError = new TypeError("'text/html' is not a valid JavaScript MIME type for module script 'https://example.test/assets/firebaseBackend-old.js'.");

function setup(entries = new Map(), options = {}) {
  const target = new EventTarget();
  let reloads = 0;
  const browser = {
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    navigator: { onLine: true },
    location: { reload() { reloads += 1; } },
    sessionStorage: {
      getItem(key) { return entries.get(key) ?? null; },
      setItem(key, value) { entries.set(key, value); },
    },
    ...options,
  };
  return {
    browser,
    get reloads() { return reloads; },
    dispatch(error = safariError) {
      const event = new Event("vite:preloadError", { cancelable: true });
      event.payload = error;
      target.dispatchEvent(event);
      return event;
    },
  };
}

test("recognizes Safari MIME failures and browser-specific module/CSS loading failures", () => {
  for (const error of [
    safariError,
    new TypeError("Importing a module script failed."),
    new TypeError("Failed to fetch dynamically imported module: https://example.test/assets/backend-old.js"),
    new TypeError("error loading dynamically imported module: https://example.test/assets/backend-old.js"),
    new Error("Unable to preload CSS for /assets/signin-old.css"),
  ]) assert.equal(isModuleLoadError(error), true, error.message);
});

test("does not treat auth, data, network fetch, or module evaluation errors as missing assets", () => {
  for (const error of [
    new Error("Firebase: Error (auth/network-request-failed)."),
    new Error("Could not save your habit"),
    new TypeError("Failed to fetch"),
    new TypeError("Load failed"),
    new TypeError("Cannot read properties of undefined"),
    null, {}, undefined,
  ]) assert.equal(isModuleLoadError(error), false);
});

test("refreshes only once despite concurrent failed imports and keeps the original rejection", () => {
  const state = setup();
  installModuleLoadRecovery(state.browser, () => 1_000_000);
  assert.equal(state.dispatch().defaultPrevented, false);
  state.dispatch();
  state.dispatch(new TypeError("Importing a module script failed."));
  assert.equal(state.reloads, 1);
});

test("a fresh document cannot loop when the new deployment also has a missing chunk", () => {
  const entries = new Map([["unrelated-user-preference", "keep me"]]);
  const original = setup(entries);
  installModuleLoadRecovery(original.browser, () => 1_000_000);
  original.dispatch();
  const fresh = setup(entries);
  installModuleLoadRecovery(fresh.browser, () => 1_000_001);
  fresh.dispatch();
  assert.equal(original.reloads, 1);
  assert.equal(fresh.reloads, 0);
  assert.equal(entries.size, 2);
  assert.equal(entries.get("unrelated-user-preference"), "keep me");
});

test("a tab can recover from a later deployment after the cooldown", () => {
  const entries = new Map();
  const original = setup(entries);
  installModuleLoadRecovery(original.browser, () => 1_000_000);
  original.dispatch();
  const later = setup(entries);
  installModuleLoadRecovery(later.browser, () => 1_300_000);
  later.dispatch();
  assert.equal(later.reloads, 1);
});

test("offline and blocked or full storage leave recovery to the explicit Reload button", () => {
  const offline = setup(new Map(), { navigator: { onLine: false } });
  installModuleLoadRecovery(offline.browser);
  offline.dispatch();
  assert.equal(offline.reloads, 0);

  for (const operation of ["getItem", "setItem"]) {
    const state = setup();
    state.browser.sessionStorage[operation] = () => { throw new Error("Storage unavailable"); };
    installModuleLoadRecovery(state.browser);
    assert.doesNotThrow(() => state.dispatch());
    assert.equal(state.reloads, 0);
  }

  const denied = setup();
  Object.defineProperty(denied.browser, "sessionStorage", { get() { throw new Error("Storage access denied"); } });
  installModuleLoadRecovery(denied.browser);
  assert.doesNotThrow(() => denied.dispatch());
  assert.equal(denied.reloads, 0);
});

test("unrelated preload errors do not trigger a refresh; listeners can be removed", () => {
  const state = setup();
  const remove = installModuleLoadRecovery(state.browser);
  state.dispatch(new Error("Bug while evaluating a module"));
  assert.equal(state.reloads, 0);
  remove();
  state.dispatch();
  assert.equal(state.reloads, 0);
});
