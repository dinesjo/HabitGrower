import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import dayjs from "dayjs";

const directory = await mkdtemp(join(tmpdir(), "habitgrower-history-test-"));
after(() => rm(directory, { recursive: true, force: true }));
for (const name of ["habitHistory", "helpers"]) {
  const source = await readFile(new URL(`../src/utils/${name}.ts`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText
    .replace('"dayjs"', JSON.stringify(import.meta.resolve("dayjs")))
    .replace('"./habitHistory"', '"./habitHistory.mjs"')
    .replace('"../store"', '"./store.mjs"');
  await writeFile(join(directory, `${name}.mjs`), compiled);
}
await writeFile(join(directory, "store.mjs"), "export const store = {}; export const snackbarActionAtom = null, snackbarMessageAtom = null, snackbarSeverityAtom = null;");
const { countRegistrations, groupRegistrations, registrationCount } = await import(pathToFileURL(join(directory, "habitHistory.mjs")));
const { getProgress } = await import(pathToFileURL(join(directory, "helpers.mjs")));

const dates = {
  "2026-10-26T08:00:00Z": 3,
  "2026-10-26T18:00:00Z": true,
  "2026-10-27T08:00:00Z": 2,
  "2026-10-27T18:00:00Z": 4,
  "2026-10-28T08:00:00Z": false,
  "2026-10-28T18:00:00Z": 0,
};

test("daily, weekly, and monthly aggregation sums counts and preserves legacy booleans", () => {
  assert.equal(countRegistrations(dates), 10);
  assert.deepEqual(groupRegistrations(dates, (date) => date.slice(0, 10)), { "2026-10-26": 4, "2026-10-27": 6 });
  assert.deepEqual(groupRegistrations(dates, (date) => dayjs(date).startOf("week").format("YYYY-MM-DD")), { "2026-10-25": 10 });
  assert.deepEqual(groupRegistrations(dates, (date) => date.slice(0, 7)), { "2026-10": 10 });
  assert.equal(countRegistrations(dates, (date) => date.startsWith("2026-10-27")), 6);
});

test("empty history and non-positive or non-finite counts contribute no registrations", () => {
  assert.equal(countRegistrations(undefined), 0);
  assert.deepEqual(groupRegistrations({}, (date) => date), {});
  for (const value of [false, 0, -1, NaN, Infinity]) assert.equal(registrationCount(value), 0);
  assert.equal(registrationCount(true), 1);
  assert.equal(registrationCount(3), 3);
});

test("goal progress uses the same count total and only includes the current period", () => {
  const today = dayjs().startOf("day").add(1, "hour");
  const habit = { id: "a", name: "Water", icon: "Default", frequency: 3, frequencyUnit: "day", dates: {
    [today.subtract(1, "day").toISOString()]: 9,
    [today.toISOString()]: 2,
  } };
  assert.equal(getProgress(habit, false, false), 2 / 3 * 100);
  assert.equal(getProgress(habit, true, false), 100);
  habit.dates[today.toISOString()] = 3;
  assert.equal(getProgress(habit, false, false), 100);
});
