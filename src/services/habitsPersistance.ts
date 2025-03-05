import dayjs from "dayjs";
import { get, push, ref, set } from "firebase/database";
import { database, getUser } from "../firebase";
import { Habit } from "../types/Habit";

async function getUserIdOrThrow(): Promise<string> {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  return user.uid;
}

export async function fetchAllHabits(): Promise<Habit[]> {
  const userId = await getUserIdOrThrow();

  const habits = await get(ref(database, `users/${userId}/habits`)).then((snapshot) => {
    if (snapshot.exists()) {
      const habitsData = snapshot.val();
      return Object.entries(habitsData).map(([key, habit]) => ({
        ...(habit as Habit),
        id: key,
      }));
    }
    return [];
  });

  return habits;
}

export async function fetchHabitById(id: string): Promise<Habit | undefined> {
  const userId = await getUserIdOrThrow();

  return await get(ref(database, `users/${userId}/habits/${id}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const habit = snapshot.val() as Habit;
      habit.id = id;
      return habit;
    }
  });
}

/**
 * @returns the id of the new habit
 */
export async function createEmptyHabit(): Promise<string> {
  const userId = await getUserIdOrThrow();
  // Push a new habit to the database
  const newHabitRef = push(ref(database, `users/${userId}/habits`));
  await set(newHabitRef, {
    name: "New Habit",
    icon: "Default",
    notificationEnabled: false,
    notificationTime: null,
  });
  return newHabitRef.key!; // can't be null since not root
}

export async function updateHabit(id: string, habit: Habit): Promise<void> {
  const userId = await getUserIdOrThrow();

  const habitRef = ref(database, `users/${userId}/habits/${id}`);
  const currentHabit = await get(habitRef).then((snapshot) => snapshot.val());
  await set(habitRef, { ...currentHabit, ...habit });
}

export async function deleteHabit(id: string): Promise<void> {
  const userId = await getUserIdOrThrow();

  const habitRef = ref(database, `users/${userId}/habits/${id}`);
  await set(habitRef, null);
}

export async function registerHabitsNow(ids: string[]): Promise<void> {
  const userId = await getUserIdOrThrow();

  const today = dayjs();
  const todayString = today.toISOString().split(".")[0] + "Z"; // +Z for UTC

  for (const id of ids) {
    const todayRef = ref(database, `users/${userId}/habits/${id}/dates/${todayString}`);
    // Increase the count of the habit for today
    const currentCount = await get(todayRef).then((snapshot) => Number(snapshot.val()) || 0);
    await set(todayRef, currentCount + 1);
  }
}

export async function unregisterHabitByDate(id: string, date: string): Promise<void> {
  const userId = await getUserIdOrThrow();

  const dateRef = ref(database, `users/${userId}/habits/${id}/dates/${date}`);
  await set(dateRef, null);
}
