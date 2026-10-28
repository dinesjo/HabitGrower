import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Compile the actual backend, with no browser, Firebase SDK, or test dependencies.
const directory = await mkdtemp(join(tmpdir(), "habitgrower-local-test-"));
after(() => rm(directory, { recursive: true, force: true }));
for (const name of ["sampleHabits", "localBackend", "habitRegistration", "habitGoal"]) {
  const source = await readFile(new URL(`../src/${["habitRegistration", "habitGoal"].includes(name) ? "utils" : "data"}/${name}.ts`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText.replace('"./sampleHabits"', '"./sampleHabits.mjs"')
    .replace('"../utils/habitRegistration"', '"./habitRegistration.mjs"')
    .replace('"../utils/habitGoal"', '"./habitGoal.mjs"');
  await writeFile(join(directory, `${name}.mjs`), compiled);
}
const { createLocalBackend, LOCAL_STORAGE_KEY } = await import(pathToFileURL(join(directory, "localBackend.mjs")));
const timestamp = new Date("2026-10-11T12:00:00Z");

function setup() {
  const entries = new Map([["unrelated-data", "keep me"]]);
  const storage = {
    getItem(key) { return entries.get(key) ?? null; },
    setItem(key, value) { entries.set(key, value); },
  };
  return { entries, storage, backend: createLocalBackend(storage, () => timestamp) };
}

test("starts with a synthetic user and fresh daily, weekly, monthly, and empty histories", async () => {
  const { backend } = setup();
  assert.equal((await backend.getUser()).uid, "local-demo");
  let observed;
  backend.subscribeUser((user) => { observed = user; });
  assert.equal(observed.uid, "local-demo");
  const habits = await backend.fetchAllHabits();
  assert.equal(habits.length, 5);
  assert.deepEqual(new Set(habits.map((habit) => habit.frequencyUnit)), new Set(["day", "week", "month"]));
  assert.equal((await backend.fetchHabitById("demo-stretching")).dates, undefined);
  assert.ok(Object.keys(habits[0].dates).every((date) => new Date(date) < timestamp));
});

test("CRUD, reload persistence, safe copies, notification isolation, and delete undo", async () => {
  const { backend, storage } = setup();
  const id = await backend.createHabit({ name: "Initial habit", icon: "Default" });
  const habit = await backend.fetchHabitById(id);
  await backend.updateHabit(id, { ...habit, name: "Test habit", frequency: "2", frequencyUnit: "day", notificationEnabled: true });
  const reloaded = createLocalBackend(storage, () => timestamp);
  const saved = await reloaded.fetchHabitById(id);
  assert.equal(saved.name, "Test habit");
  assert.equal(saved.frequency, 2);
  assert.equal((await reloaded.fetchAllHabits()).length, 6);
  assert.equal(saved.notificationEnabled, false);
  saved.name = "unsaved mutation";
  assert.equal((await backend.fetchHabitById(id)).name, "Test habit");
  await backend.deleteHabit(id);
  assert.equal(await backend.fetchHabitById(id), undefined);
  await backend.updateHabit(id, { ...habit, name: "Restored" });
  assert.equal((await backend.fetchHabitById(id)).name, "Restored");
});

test("repeated check-ins at the same timestamp increment; history removal persists", async () => {
  const { backend, storage } = setup();
  const id = "demo-stretching";
  const date = "2026-10-11T12:00:00Z";
  await backend.registerHabitsNow([id, "demo-reading"]);
  await backend.registerHabitsNow([id]);
  assert.equal((await backend.fetchHabitById(id)).dates[date], 2);
  await backend.unregisterHabitByDate(id, date);
  assert.equal((await createLocalBackend(storage).fetchHabitById(id)).dates[date], undefined);
});

test("creation persists completed details once and a failed save leaves no placeholder", async () => {
  const { backend, storage } = setup();
  await backend.fetchAllHabits();
  const writes = [];
  let fail = false;
  const recording = createLocalBackend({
    ...storage,
    setItem(key, value) {
      writes.push(value);
      if (fail) throw new Error("quota");
      storage.setItem(key, value);
    },
  });
  const details = { name: "Read", icon: "AutoStories", frequency: 2, frequencyUnit: "week" };
  const id = await recording.createHabit(details);
  assert.equal(writes.length, 1);
  assert.deepEqual(await backend.fetchHabitById(id), { ...details, id, notificationEnabled: false });
  const before = await backend.fetchAllHabits();
  fail = true;
  await assert.rejects(recording.createHabit(details), /Could not save/);
  assert.deepEqual(await backend.fetchAllHabits(), before);
});

test("local persistence rejects invalid goals without changing data and supports clearing a goal", async () => {
  const { backend } = setup();
  const before = await backend.fetchAllHabits();
  for (const goal of [
    { frequency: -1, frequencyUnit: "day" }, { frequency: 0, frequencyUnit: "day" },
    { frequency: 1.5, frequencyUnit: "week" }, { frequency: 2 }, { frequencyUnit: "month" },
  ]) {
    const habit = { id: "demo-reading", name: "Read", icon: "AutoStories", ...goal };
    await assert.rejects(backend.createHabit(habit), /Check your habit goal/);
    await assert.rejects(backend.updateHabit(habit.id, habit), /Check your habit goal/);
    assert.deepEqual(await backend.fetchAllHabits(), before);
  }
  const habit = await backend.fetchHabitById("demo-water");
  await backend.updateHabit(habit.id, { ...habit, frequency: "", frequencyUnit: "" });
  const saved = await backend.fetchHabitById(habit.id);
  assert.equal(saved.frequency, undefined);
  assert.equal(saved.frequencyUnit, undefined);
  assert.deepEqual(saved.dates, habit.dates);
});

test("invalid check-in batches do not partially save", async () => {
  const { backend } = setup();
  const before = await backend.fetchAllHabits();
  await assert.rejects(backend.registerHabitsNow(["demo-reading", "missing"]), /Habit not found/);
  assert.deepEqual(await backend.fetchAllHabits(), before);
});

test("registration failures leave all habits unchanged and an explicit click timestamp survives the save", async () => {
  const { backend, storage } = setup();
  const before = await backend.fetchAllHabits();
  const rejecting = createLocalBackend(storage, () => timestamp, { fail: true });
  await assert.rejects(rejecting.registerHabitsNow(["demo-reading", "demo-stretching"]), /Simulated registration failure/);
  assert.deepEqual(await backend.fetchAllHabits(), before);
  const clickedAt = "2026-10-11T11:59:59Z";
  await backend.registerHabitsNow(["demo-stretching", "demo-stretching"], clickedAt);
  assert.equal((await backend.fetchHabitById("demo-stretching")).dates[clickedAt], 1);
});

test("a rejected batch can be retried without adding either check-in twice", async () => {
  const { backend, storage } = setup();
  const before = await backend.fetchAllHabits();
  const flaky = createLocalBackend(storage, () => timestamp, { failOnce: true });
  const ids = ["demo-stretching", "demo-reading"];
  await assert.rejects(flaky.registerHabitsNow(ids), /Simulated/);
  assert.deepEqual(await backend.fetchAllHabits(), before);
  await flaky.registerHabitsNow(ids);
  for (const id of ids) assert.equal((await backend.fetchHabitById(id)).dates["2026-10-11T12:00:00Z"], 1);
});

test("deleting every habit stays empty after reload until explicit reset", async () => {
  const { backend, storage } = setup();
  for (const habit of await backend.fetchAllHabits()) await backend.deleteHabit(habit.id);
  assert.deepEqual(await createLocalBackend(storage).fetchAllHabits(), []);
  await backend.resetDemoData();
  assert.equal((await backend.fetchAllHabits()).length, 5);
});

test("preferences persist and reset only affects the demo namespace", async () => {
  const { backend, storage, entries } = setup();
  await backend.writePreference("weekStartsAtMonday", true);
  await backend.writePreference("dayStartsAt", "2026-10-11T06:30:00Z");
  assert.equal(await createLocalBackend(storage).readPreference("weekStartsAtMonday"), true);
  await backend.resetDemoData();
  assert.equal(await backend.readPreference("weekStartsAtMonday"), false);
  assert.equal(await backend.readPreference("dayStartsAt"), null);
  assert.equal(entries.get("unrelated-data"), "keep me");
});

test("malformed data recovers; browser storage failures stay local and fail explicitly", async () => {
  const { backend, entries } = setup();
  for (const raw of ["broken json", JSON.stringify({ version: 1, habits: [null], preferences: {} })]) {
    entries.set(LOCAL_STORAGE_KEY, raw);
    assert.equal((await backend.fetchAllHabits()).length, 5);
  }
  const unavailable = createLocalBackend({ getItem() { throw new Error("denied"); }, setItem() {} });
  await assert.rejects(unavailable.fetchAllHabits(), /Could not read local demo data/);
  const full = createLocalBackend({ getItem() { return null; }, setItem() { throw new Error("quota"); } });
  await assert.rejects(full.createHabit({ name: "Test", icon: "Default" }), /Could not save local demo data/);
});

test("the app's eager import graph contains no Firebase SDK or initializer", async () => {
  const visited = new Set();
  async function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = await readFile(file, "utf8");
    // Transpilation removes type-only imports; dynamic imports remain lazy.
    const compiled = ts.transpileModule(source, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const ast = ts.createSourceFile(file, compiled, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    for (const node of ast.statements) {
      if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) continue;
      if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const specifier = node.moduleSpecifier.text;
      assert.ok(!specifier.startsWith("firebase"), `Unexpected eager SDK import: ${file} -> ${specifier}`);
      if (!specifier.startsWith(".") || /\.(css|svg)$/.test(specifier)) continue;
      const path = new URL(specifier, pathToFileURL(file));
      let resolved;
      for (const extension of [".ts", ".tsx"]) {
        const candidate = new URL(path.href + extension);
        try { await readFile(candidate); resolved = candidate; break; } catch { /* Try the next extension. */ }
      }
      assert.ok(resolved, `Cannot resolve ${specifier} from ${file}`);
      assert.ok(!resolved.pathname.endsWith("/firebase.ts"), `Unexpected eager Firebase initialization in ${file}`);
      await visit(resolved.pathname);
    }
  }
  await visit(new URL("../src/main.tsx", import.meta.url).pathname);
  assert.ok([...visited].some((file) => file.endsWith("/data/backend.ts")));
});
