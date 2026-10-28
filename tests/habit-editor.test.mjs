import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const directory = await mkdtemp(join(tmpdir(), "habitgrower-editor-test-"));
after(() => rm(directory, { recursive: true, force: true }));
const source = await readFile(new URL("../src/routes/habitEditorActions.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
  .replace('"react-router-dom"', JSON.stringify(import.meta.resolve("react-router-dom")))
  .replace('"../services/habitsPersistance"', '"./persistence.mjs"')
  .replace('"../utils/helpers"', '"./feedback.mjs"');
await writeFile(join(directory, "actions.mjs"), compiled);
await writeFile(join(directory, "persistence.mjs"), `
export const calls = [];
let reject = false;
export function reset(fail = false) { calls.length = 0; reject = fail; }
export async function createHabit(habit) { calls.push(["create", habit]); if (reject) throw new Error("save failed"); return "created-id"; }
export async function updateHabit(id, habit) { calls.push(["update", id, habit]); if (reject) throw new Error("save failed"); }
`);
await writeFile(join(directory, "feedback.mjs"), "export const messages = []; export function showSnackBar(...args) { messages.push(args); }");
const { newHabitLoader, saveHabitAction } = await import(pathToFileURL(join(directory, "actions.mjs")));
const persistence = await import(pathToFileURL(join(directory, "persistence.mjs")));
const { messages } = await import(pathToFileURL(join(directory, "feedback.mjs")));

function submission(params = {}) {
  return { params, request: new Request("http://localhost/new-habit", {
    method: "POST", body: new URLSearchParams({ name: "Read", icon: "AutoStories", description: "A few pages", frequency: "2", frequencyUnit: "week" }),
  }) };
}

test("opening or reopening creation only creates a fresh unsaved draft", () => {
  persistence.reset();
  const draft = newHabitLoader().habit;
  draft.name = "Abandoned draft";
  assert.equal(newHabitLoader().habit.name, "");
  assert.deepEqual(persistence.calls, []);
});

test("Create submits the completed habit once, while Edit updates the existing ID", async () => {
  persistence.reset();
  const result = await saveHabitAction(submission());
  assert.equal(result.headers.get("Location"), "/");
  assert.equal(persistence.calls.length, 1);
  assert.equal(persistence.calls[0][0], "create");
  assert.equal(persistence.calls[0][1].name, "Read");
  assert.equal(persistence.calls[0][1].description, "A few pages");
  assert.equal(persistence.calls[0][1].notificationEnabled, false);
  persistence.reset();
  await saveHabitAction(submission({ id: "existing-id" }));
  assert.deepEqual(persistence.calls[0].slice(0, 2), ["update", "existing-id"]);
});

test("save failures return form feedback without a success message or redirect", async () => {
  for (const params of [{}, { id: "existing-id" }]) {
    persistence.reset(true);
    messages.length = 0;
    const result = await saveHabitAction(submission(params));
    assert.match(result.error, /Couldn't save/);
    assert.deepEqual(messages, []);
    assert.equal(persistence.calls.length, 1);
  }
});
