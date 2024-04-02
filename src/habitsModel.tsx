import { get, push, ref, set } from "firebase/database";
import { database, getUser } from "./firebase";

export interface Habit {
  name: string;
  description: string | null;
  icon: string;
  frequency: number | null;
  frequencyUnit: "day" | "week" | "month" | null;
  startDate: Date | null;
  endDate: Date | null;
  color: string | null;
}

export async function fetchHabits() {
  const userId = await getUser().then((user) => {
    if (user) {
      return user.uid;
    } else {
      throw new Error("User not found");
    }
  });

  return await get(ref(database, "users/" + userId + "/habits"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val() as { [key: string]: Habit };
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function fetchHabitById(id: string) {
  const userId = await getUser().then((user) => {
    if (user) {
      return user.uid;
    } else {
      throw new Error("User not found");
    }
  });

  return await get(ref(database, "users/" + userId + "/habits/" + id))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val() as Habit;
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function createEmptyHabit() {
  const userId = await getUser().then((user) => {
    if (user) {
      return user.uid;
    } else {
      throw new Error("User not found");
    }
  });
  // Push a new habit to the database
  const newHabitRef = push(ref(database, "users/" + userId + "/habits"));
  await set(newHabitRef, {
    name: "New Habit",
    icon: "Default",
  });
  return newHabitRef.key;
}

export async function updateHabit(id: string, habit: Habit) {
  const userId = await getUser().then((user) => {
    if (user) {
      return user.uid;
    } else {
      throw new Error("User not found");
    }
  });

  const habitRef = ref(database, "users/" + userId + "/habits/" + id);
  return await set(habitRef, habit);
}

export async function deleteHabit(id: string) {
  const userId = await getUser().then((user) => {
    if (user) {
      return user.uid;
    } else {
      throw new Error("User not found");
    }
  });

  const habitRef = ref(database, "users/" + userId + "/habits/" + id);
  return await set(habitRef, null);
}
