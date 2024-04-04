import { get, push, ref, set } from "firebase/database";
import { database, getUser } from "./firebase";

export interface Habit {
  name: string;
  description: string | null;
  icon: string;
  frequency: number | null;
  frequencyUnit: "day" | "week" | "month" | null;
  color: string | null;
  dates?: Record<string, number>;
}

async function getUserIdOrThrow(): Promise<string> {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  return user.uid;
}

export async function fetchHabits(): Promise<{ [key: string]: Habit } | undefined> {
  const userId = await getUserIdOrThrow();

  return await get(ref(database, "users/" + userId + "/habits")).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val() as { [key: string]: Habit };
    }
  });
}

export async function fetchHabitById(id: string): Promise<Habit | undefined> {
  const userId = await getUserIdOrThrow();

  return await get(ref(database, "users/" + userId + "/habits/" + id)).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val() as Habit;
    }
  });
}

export async function createEmptyHabit(): Promise<string> {
  const userId = await getUserIdOrThrow();
  // Push a new habit to the database
  const newHabitRef = push(ref(database, "users/" + userId + "/habits"));
  await set(newHabitRef, {
    name: "New Habit",
    icon: "Default",
  });
  return newHabitRef.key!;
}

export async function updateHabit(id: string, habit: Habit): Promise<void> {
  const userId = await getUserIdOrThrow();

  const habitRef = ref(database, "users/" + userId + "/habits/" + id);
  const currentHabit = await get(habitRef).then((snapshot) => snapshot.val());
  await set(habitRef, { ...currentHabit, ...habit });
}

export async function deleteHabit(id: string): Promise<void> {
  const userId = await getUserIdOrThrow();

  const habitRef = ref(database, "users/" + userId + "/habits/" + id);
  await set(habitRef, null);
}

export async function registerHabitsNow(ids: string[]): Promise<void> {
  const userId = await getUserIdOrThrow();

  const today = new Date();
  const todayString = today.toISOString().split(".")[0] + "Z";
  for (const id of ids) {
    const habitRef = ref(database, "users/" + userId + "/habits/" + id + "/dates/" + todayString);
    const currentCount = await get(habitRef).then((snapshot) => snapshot.val() || 0);
    await set(habitRef, currentCount + 1);
  }
}
