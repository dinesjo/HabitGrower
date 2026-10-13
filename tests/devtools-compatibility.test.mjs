import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// Resolve the overridden dependency from the devtools package itself.
const require = createRequire(import.meta.url);
const devtoolsRequire = createRequire(require.resolve("jotai-devtools"));
const { DiffPatcher } = await import(pathToFileURL(devtoolsRequire.resolve("jsondiffpatch")));

test("the patched devtools diff engine preserves atom snapshot comparisons and reversibility", () => {
  const diffPatcher = new DiffPatcher({ arrays: { detectMove: false } });
  const before = { checked: ["water"], schedule: { monday: false }, count: 1 };
  const after = { checked: ["water", "reading"], schedule: { monday: true }, count: 2 };
  const delta = diffPatcher.diff(before, after);
  assert.ok(delta);
  assert.deepEqual(diffPatcher.patch(structuredClone(before), delta), after);
  assert.deepEqual(diffPatcher.unpatch(structuredClone(after), delta), before);
  assert.equal(diffPatcher.diff(after, structuredClone(after)), undefined);
});
