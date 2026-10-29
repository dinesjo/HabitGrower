import type { Habit } from "../types/Habit";
import { createSampleHabits } from "./sampleHabits";
import type { AppBackend, AppUser, Preferences } from "./types";
import { registrationTimestamp } from "../utils/habitRegistration";
import { normalizeHabitGoal } from "../utils/habitGoal";

export const LOCAL_STORAGE_KEY = "habitgrower.local-demo.v1";
const demoUser: AppUser = { uid: "local-demo", displayName: "Local demo", email: "demo@example.test", photoURL: null };

interface DemoData {
  version: 1;
  habits: Habit[];
  preferences: Preferences;
}

function isDemoData(value: unknown): value is DemoData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as DemoData;
  return data.version === 1 && Array.isArray(data.habits) && data.habits.every((habit) =>
    habit && typeof habit.id === "string" && typeof habit.name === "string" && typeof habit.icon === "string" &&
    [habit.description, habit.color, habit.notificationTime].every((field) => field === undefined || typeof field === "string") &&
    (habit.frequency === undefined || (typeof habit.frequency === "number" && Number.isFinite(habit.frequency))) &&
    (habit.frequencyUnit === undefined || ["day", "week", "month"].includes(habit.frequencyUnit)) &&
    (!habit.dates || (typeof habit.dates === "object" && !Array.isArray(habit.dates) && Object.entries(habit.dates).every(([date, count]) =>
      Number.isFinite(Date.parse(date)) && (typeof count === "boolean" || (typeof count === "number" && Number.isFinite(count) && count >= 0))
    )))
  ) && new Set(data.habits.map((habit) => habit.id)).size === data.habits.length &&
    !!data.preferences && !Array.isArray(data.preferences) && typeof data.preferences.weekStartsAtMonday === "boolean" &&
    (data.preferences.dayStartsAt === null || (typeof data.preferences.dayStartsAt === "string" && Number.isFinite(Date.parse(data.preferences.dayStartsAt))));
}

export function createLocalBackend(storage: Pick<Storage, "getItem" | "setItem">, now = () => new Date(), simulation: { delayMs?: number; fail?: boolean; failOnce?: boolean } = {}): AppBackend {
  let hasFailedRegistration = false;
  function seed(): DemoData {
    return { version: 1, habits: createSampleHabits(now()), preferences: { dayStartsAt: null, weekStartsAtMonday: false } };
  }

  function write(data: DemoData) {
    // Fail explicitly if storage is unavailable; never fall back to Firebase.
    try {
      storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {
      throw new Error("Could not save local demo data. Allow browser storage and check available space.");
    }
  }

  function read(): DemoData {
    let raw: string | null;
    try {
      raw = storage.getItem(LOCAL_STORAGE_KEY);
    } catch {
      throw new Error("Could not read local demo data. Allow browser storage to use the demo.");
    }
    if (raw !== null) {
      try {
        const data: unknown = JSON.parse(raw);
        if (isDemoData(data)) return data;
      } catch { /* Invalid demo storage is replaced with fresh samples. */ }
      console.warn("Invalid local demo data; restoring sample habits.");
    }
    const data = seed();
    write(data);
    return data;
  }

  function find(data: DemoData, id: string) {
    const habit = data.habits.find((habit) => habit.id === id);
    if (!habit) throw new Error("Habit not found in local demo data.");
    return habit;
  }

  return {
    async getUser() { return { ...demoUser }; },
    subscribeUser(onChange) { onChange({ ...demoUser }); return () => {}; },
    async signOut() { /* The local demo has no authenticated session. */ },
    async fetchAllHabits() { return read().habits; },
    async fetchHabitById(id) { return read().habits.find((habit) => habit.id === id); },
    async createHabit(habit) {
      const goal = normalizeHabitGoal(habit);
      const data = read();
      const id = crypto.randomUUID();
      data.habits.push({
        ...habit, id, notificationEnabled: false,
        ...goal,
      });
      write(data);
      return id;
    },
    async updateHabit(id, habit) {
      const goal = normalizeHabitGoal(habit);
      const data = read();
      const index = data.habits.findIndex((existing) => existing.id === id);
      // Upsert also supports restoring a deleted habit through Undo.
      const updated: Habit = {
        ...(index >= 0 ? data.habits[index] : {}), ...habit, id, notificationEnabled: false,
        ...goal,
      };
      if (index < 0) data.habits.push(updated);
      else data.habits[index] = updated;
      write(data);
    },
    async deleteHabit(id) {
      const data = read();
      data.habits = data.habits.filter((habit) => habit.id !== id);
      write(data);
    },
    async registerHabitsNow(ids, timestamp = registrationTimestamp(now())) {
      if (simulation.delayMs) await new Promise((resolve) => setTimeout(resolve, simulation.delayMs));
      if (simulation.fail || (simulation.failOnce && !hasFailedRegistration)) {
        hasFailedRegistration = true;
        throw new Error("Simulated registration failure.");
      }
      const data = read();
      for (const id of new Set(ids)) {
        const habit = find(data, id);
        habit.dates ??= {};
        habit.dates[timestamp] = Number(habit.dates[timestamp] || 0) + 1;
      }
      write(data);
    },
    async unregisterHabitByDate(id, date) {
      const data = read();
      const habit = find(data, id);
      if (habit.dates) delete habit.dates[date];
      write(data);
    },
    async readPreference(key) { return read().preferences[key]; },
    async writePreference(key, value) {
      const data = read();
      data.preferences[key] = value;
      write(data);
    },
    fetchFcmToken() { /* No notification service in local mode. */ },
    async resetDemoData() { write(seed()); },
  };
}
