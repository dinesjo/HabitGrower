import { get, push, ref } from "firebase/database";
import { database, getUser } from "./firebase";

export interface Habit {
  id: string;
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

  return await get(ref(database, "users/" + userId + "/habits/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val().find((habit: Habit) => habit.id === id);
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function createHabit(habit: Habit) {
  const userId = await getUser().then((user) => {
    if (user) {
      return user.uid;
    } else {
      throw new Error("User not found");
    }
  });

  return await push(ref(database, "users/" + userId + "/habits"), habit);
}
