import { getBackend } from "../data/backend";
import type { Habit } from "../types/Habit";

export async function fetchAllHabits() { return (await getBackend()).fetchAllHabits(); }
export async function fetchHabitById(id: string) { return (await getBackend()).fetchHabitById(id); }
export async function createEmptyHabit() { return (await getBackend()).createEmptyHabit(); }
export async function updateHabit(id: string, habit: Habit) { return (await getBackend()).updateHabit(id, habit); }
export async function deleteHabit(id: string) { return (await getBackend()).deleteHabit(id); }
export async function registerHabitsNow(ids: string[]) { return (await getBackend()).registerHabitsNow(ids); }
export async function unregisterHabitByDate(id: string, date: string) { return (await getBackend()).unregisterHabitByDate(id, date); }
