import type { Habit } from "../types/Habit";

export const REGISTRATION_FETCHER_KEY = "habit-registration";
export const REGISTRATION_GRACE_MS = 1000;
export const REGISTRATION_FEEDBACK_MS = 1800;

export interface RegistrationBatch {
  id: string;
  habitIds: string[];
  timestamp: string;
  expectedCounts: Record<string, number>;
  before: Habit[];
  startedAt: number;
}

export interface RegistrationState {
  phase: "saving" | "saved" | "error";
  batch: RegistrationBatch;
  acknowledged: boolean;
}

export function registrationTimestamp(date = new Date()) {
  return date.toISOString().split(".")[0] + "Z";
}

export function createRegistrationBatch(habits: Habit[], ids: string[], date = new Date()): RegistrationBatch {
  const habitIds = [...new Set(ids)];
  if (!habitIds.length) throw new Error("Select at least one habit.");
  const timestamp = registrationTimestamp(date);
  const expectedCounts: Record<string, number> = {};
  for (const id of habitIds) {
    const habit = habits.find((item) => item.id === id);
    if (!habit) throw new Error("This habit is no longer available.");
    expectedCounts[id] = Number(habit.dates?.[timestamp] || 0) + 1;
  }
  return {
    id: crypto.randomUUID(), habitIds, timestamp, expectedCounts,
    before: habits.map((habit) => ({ ...habit, ...(habit.dates && { dates: { ...habit.dates } }) })),
    startedAt: date.getTime(),
  };
}

// Keep the expected count visible while saving, without adding it a second time
// when the refreshed loader already contains the committed write.
export function projectRegistration(habits: Habit[], state: RegistrationState | null): Habit[] {
  if (!state || state.phase === "error") return habits;
  const { timestamp, expectedCounts } = state.batch;
  return habits.map((habit) => {
    const expected = expectedCounts[habit.id];
    if (expected === undefined || Number(habit.dates?.[timestamp] || 0) >= expected) return habit;
    return { ...habit, dates: { ...habit.dates, [timestamp]: expected } };
  });
}

export function restoreRegistrationSelection(selected: string[], batch: RegistrationBatch) {
  return [...new Set([...batch.habitIds, ...selected])];
}

export function registrationGraceRemaining(batch: RegistrationBatch, now = Date.now()) {
  return Math.max(0, REGISTRATION_GRACE_MS - (now - batch.startedAt));
}
