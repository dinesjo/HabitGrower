import assert from "node:assert/strict";
import { after, beforeEach, mock, test } from "node:test";
import { generateKeyPairSync } from "node:crypto";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { deleteApp, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { FirebaseMessagingError, getMessaging, MessagingErrorCode } from "firebase-admin/messaging";
import ts from "typescript";

// Exercise the real SDK's modular initialization with synthetic credentials.
// Database and messaging calls are replaced before handlers receive requests.
const directory = await mkdtemp(join(tmpdir(), "habitgrower-api-test-"));
const require = createRequire(import.meta.url);
const environment = { ...process.env };
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
process.env.FIREBASE_PROJECT_ID = "demo-habitgrower";
process.env.FIREBASE_CLIENT_EMAIL = "test@demo-habitgrower.iam.gserviceaccount.com";
process.env.FIREBASE_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).replace(/\n/g, "\\n");

async function loadHandler(name) {
  const source = await readFile(new URL(`../api/${name}.ts`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText.replace(/from "([^".][^"]*)"/g, (_, specifier) => `from "${pathToFileURL(require.resolve(specifier))}"`);
  const path = join(directory, `${name}.mjs`);
  await writeFile(path, compiled);
  return (await import(pathToFileURL(path))).default;
}

const registerHabit = await loadHandler("registerHabitNow");
const notify = await loadHandler("sendNotificationIfTime");
const db = getDatabase();
const messaging = getMessaging();
let data;
let sent;
let failToken;

mock.method(db, "ref", (path) => {
  const keys = path.split("/");
  const value = () => keys.reduce((entry, key) => entry?.[key], data) ?? null;
  const write = (next) => {
    let parent = data;
    for (const key of keys.slice(0, -1)) parent = parent[key] ??= {};
    if (next === null) delete parent[keys.at(-1)];
    else parent[keys.at(-1)] = next;
  };
  return {
    async get() { return { exists: () => value() !== null, val: value }; },
    async set(next) { write(next); },
    async remove() { write(null); },
  };
});
mock.method(messaging, "send", async (message) => {
  sent.push(message);
  if (message.token === failToken) throw new FirebaseMessagingError({
    code: MessagingErrorCode.REGISTRATION_TOKEN_NOT_REGISTERED, message: "Expired token",
  });
  return "test-message-id";
});

beforeEach(() => {
  data = {};
  sent = [];
  failToken = undefined;
});
after(async () => {
  mock.restoreAll();
  await Promise.all(getApps().map(deleteApp));
  for (const key of ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]) {
    if (environment[key] === undefined) delete process.env[key];
    else process.env[key] = environment[key];
  }
  await rm(directory, { recursive: true, force: true });
});

function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { this.ended = true; return this; },
  };
}

test("both API modules reuse one initialized Firebase Admin app", () => {
  assert.equal(getApps().length, 1);
  assert.equal(getApps()[0].options.credential.projectId, "demo-habitgrower");
});

test("registration preserves preflight, method, parameter, and missing-habit responses", async () => {
  for (const [request, code, body] of [
    [{ method: "OPTIONS", query: {} }, 200, undefined],
    [{ method: "GET", query: {} }, 405, { error: "Method Not Allowed" }],
    [{ method: "POST", query: {} }, 400, { error: "Missing parameters." }],
    [{ method: "POST", query: { userId: "user", habitId: "missing" } }, 404, { error: "Habit not found." }],
  ]) {
    const res = response();
    await registerHabit(request, res);
    assert.equal(res.statusCode, code);
    assert.deepEqual(res.body, body);
    assert.equal(res.headers["Access-Control-Allow-Origin"], "https://habitgrower.web.app");
  }
});

test("registration increments stored counts without replacing habit details", async () => {
  data = { users: { user: { habits: { water: { name: "Water" } } } } };
  const req = { method: "POST", query: { userId: "user", habitId: "water" } };
  for (let i = 0; i < 2; i++) {
    const res = response();
    await registerHabit(req, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { message: "Habit registered." });
  }
  const habit = data.users.user.habits.water;
  assert.equal(habit.name, "Water");
  assert.equal(Object.values(habit.dates).reduce((total, count) => total + count, 0), 2);
  assert.ok(Object.keys(habit.dates).every((date) => /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(date)));
});

function schedule() {
  const now = new Date();
  const time = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
  const habit = { name: "Water", icon: "Water", frequency: 1, frequencyUnit: "day", notificationEnabled: true, notificationTime: time };
  data = { users: { user: {
    fcmTokens: { valid: "valid-token" },
    habits: {
      due: habit,
      disabled: { ...habit, notificationEnabled: false },
      completed: { ...habit, dates: { [now.toISOString()]: 1 } },
      later: { ...habit, notificationTime: "other-time" },
    },
  } } };
}

test("notifications send only enabled, incomplete habits due at the current UTC time", async () => {
  schedule();
  const res = response();
  await notify({ method: "POST", query: {} }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { message: "1 notifications sent!" });
  assert.deepEqual(sent, [{ token: "valid-token", data: {
    title: "Water", progressPercent: "0", frequencyUnit: "day", habitId: "due", userId: "user", habitIcon: "Water",
  } }]);
});

test("notification bypass includes completed and later habits but keeps disabled habits excluded", async () => {
  schedule();
  await notify({ method: "POST", query: { bypass: "1" } }, response());
  assert.deepEqual(new Set(sent.map((message) => message.data.habitId)), new Set(["due", "completed", "later"]));
});

test("expired notification tokens are removed without deleting other tokens", async () => {
  schedule();
  data.users.user.fcmTokens.expired = "expired-token";
  failToken = "expired-token";
  await notify({ method: "POST", query: {} }, response());
  assert.deepEqual(data.users.user.fcmTokens, { valid: "valid-token" });
});

test("notification method, empty database, and no-due responses remain unchanged", async () => {
  for (const [request, expected] of [
    [{ method: "GET", query: {} }, { error: "Method Not Allowed" }],
    [{ method: "POST", query: {} }, { message: "No users found." }],
  ]) {
    const res = response();
    await notify(request, res);
    assert.deepEqual(res.body, expected);
  }
  data = { users: { user: { habits: {}, fcmTokens: { valid: "valid-token" } } } };
  const res = response();
  await notify({ method: "POST", query: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: "No notifications due." });
});
