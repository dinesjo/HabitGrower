import { get, push, ref, set } from "firebase/database";
import { database, getUser } from "./firebase";
import dayjs from "dayjs";

export interface Habit {
  name: string;
  description: string | null;
  icon: string;
  frequency: number | null;
  frequencyUnit: "day" | "week" | "month" | null;
  color: string | null;
  dates?: Record<string, boolean>;
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

  const today = dayjs();
  const todayString = today.toISOString().split(".")[0] + "Z"; // +Z for UTC

  for (const id of ids) {
    const todayRef = ref(database, "users/" + userId + "/habits/" + id + "/dates/" + todayString);
    // Increase the count of the habit for today
    const currentCount = await get(todayRef).then((snapshot) => Number(snapshot.val()) || 0);
    await set(todayRef, currentCount + 1);
  }
}
