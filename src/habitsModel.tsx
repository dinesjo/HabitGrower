import { get, push, ref, set } from "firebase/database";
import { database, getUser } from "./firebase";

export interface Habit {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  frequency?: number;
  frequencyUnit?: "day" | "week" | "month";
  startDate?: Date;
  endDate?: Date;
  color?: string;
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
        console.log(snapshot.val());
        return snapshot.val();
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
        return snapshot.val();
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
