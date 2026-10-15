import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const directory = await mkdtemp(join(tmpdir(), "habitgrower-registration-test-"));
after(() => rm(directory, { recursive: true, force: true }));
for (const [name, folder] of [["habitRegistration", "utils"], ["firebaseHabits", "data"]]) {
  const source = await readFile(new URL(`../src/${folder}/${name}.ts`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText
    .replace('"firebase/database"', '"./database.mjs"')
    .replace('"../firebase"', '"./auth.mjs"')
    .replace('"../utils/habitRegistration"', '"./habitRegistration.mjs"');
  await writeFile(join(directory, `${name}.mjs`), compiled);
}
await writeFile(join(directory, "auth.mjs"), 'export const database = {}; export async function getUser() { return { uid: "test-user" }; }');
await writeFile(join(directory, "database.mjs"), `
export const calls = [];
export const values = new Map();
export let readFailure = null;
export let writeFailure = null;
export function reset() { calls.length = 0; values.clear(); readFailure = null; writeFailure = null; }
export function failRead(path) { readFailure = path; }
export function failWrite() { writeFailure = new Error("write rejected"); }
export function ref(_, path) { return path; }
export function increment(delta) { return { ".sv": { increment: delta } }; }
export async function get(path) { calls.push(["get", path]); if (path === readFailure) throw new Error("read rejected"); return { val: () => values.get(path) ?? null }; }
export async function update(path, payload) { calls.push(["update", path, payload]); if (writeFailure) throw writeFailure; }
export function push() { throw new Error("Unexpected push"); }
export function set() { throw new Error("Registration must use one atomic update"); }
`);

const helpers = await import(pathToFileURL(join(directory, "habitRegistration.mjs")));
const firebase = await import(pathToFileURL(join(directory, "firebaseHabits.mjs")));
const db = await import(pathToFileURL(join(directory, "database.mjs")));
const now = new Date("2026-10-14T12:00:00Z");
const timestamp = helpers.registrationTimestamp(now);
const habits = [{ id: "a", name: "Water", icon: "Default", dates: {} }, { id: "b", name: "Read", icon: "Default" }];

test("optimistic counts remain visible through a stale read and never double an acknowledged check-in", () => {
  const batch = helpers.createRegistrationBatch(habits, ["a", "b", "a"], now);
  assert.deepEqual(batch.habitIds, ["a", "b"]);
  const saving = { phase: "saving", batch, acknowledged: false };
  const optimistic = helpers.projectRegistration(habits, saving);
  assert.equal(optimistic[0].dates[timestamp], 1);
  assert.equal(optimistic[1].dates[timestamp], 1);
  assert.deepEqual(habits[0].dates, {});
  assert.equal(habits[1].dates, undefined);
  const saved = { ...saving, acknowledged: true, phase: "saved" };
  assert.equal(helpers.projectRegistration(habits, saved)[0].dates[timestamp], 1);
  assert.equal(helpers.projectRegistration(optimistic, saved)[0].dates[timestamp], 1);
  assert.equal(helpers.projectRegistration(optimistic, null)[0].dates[timestamp], 1);
});

test("a rejected batch drops its optimistic overlay and preserves the next selection for retry", () => {
  const batch = helpers.createRegistrationBatch(habits, ["a"], now);
  assert.equal(helpers.projectRegistration(habits, { phase: "error", batch, acknowledged: false }), habits);
  assert.deepEqual(helpers.restoreRegistrationSelection(["b", "a"], batch), ["a", "b"]);
});

test("a second check-in at the same timestamp adds exactly one and newer server data stays authoritative", () => {
  const existing = [{ ...habits[0], dates: { [timestamp]: 1 } }];
  const batch = helpers.createRegistrationBatch(existing, ["a"], now);
  assert.equal(helpers.projectRegistration(existing, { phase: "saving", batch, acknowledged: false })[0].dates[timestamp], 2);
  const newer = [{ ...habits[0], dates: { [timestamp]: 4 } }];
  assert.equal(helpers.projectRegistration(newer, { phase: "saved", batch, acknowledged: true })[0].dates[timestamp], 4);
});

test("the grace period is bounded without postponing the backend write", () => {
  const batch = helpers.createRegistrationBatch(habits, ["a"], now);
  assert.equal(helpers.registrationGraceRemaining(batch, now.getTime() + 250), 750);
  assert.equal(helpers.registrationGraceRemaining(batch, now.getTime() + 1500), 0);
  assert.throws(() => helpers.createRegistrationBatch(habits, [], now), /Select/);
  assert.throws(() => helpers.createRegistrationBatch(habits, ["missing"], now), /no longer available/);
});

test("Firebase registration writes the entire deduplicated batch once, with numeric increments and legacy boolean counts", async () => {
  db.reset();
  db.values.set(`users/test-user/habits/a/dates/${timestamp}`, 2);
  db.values.set(`users/test-user/habits/b/dates/${timestamp}`, true);
  await firebase.registerHabitsNow(["a", "b", "a"], timestamp);
  const writes = db.calls.filter(([operation]) => operation === "update");
  assert.equal(writes.length, 1);
  assert.equal(db.calls.filter(([operation]) => operation === "get").length, 2);
  assert.deepEqual(writes[0], ["update", "users/test-user/habits", {
    [`a/dates/${timestamp}`]: { ".sv": { increment: 1 } },
    [`b/dates/${timestamp}`]: 2,
  }]);
});

test("a failed read prevents every write and a rejected atomic write propagates failure", async () => {
  db.reset();
  db.failRead(`users/test-user/habits/b/dates/${timestamp}`);
  await assert.rejects(firebase.registerHabitsNow(["a", "b"], timestamp), /read rejected/);
  assert.equal(db.calls.filter(([operation]) => operation === "update").length, 0);
  db.reset();
  db.failWrite();
  await assert.rejects(firebase.registerHabitsNow(["a", "b"], timestamp), /write rejected/);
  assert.equal(db.calls.filter(([operation]) => operation === "update").length, 1);
});
