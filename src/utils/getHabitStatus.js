import dayjs from "dayjs";
import { get, ref } from "firebase/database";
import { database, getUser } from "./firebase";

async function getUserIdOrThrow() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  return user.uid;
}

export async function habitCompletedToday(habitId) {
  const userId = await getUserIdOrThrow();
  const today = dayjs().format("YYYY-MM-DD");

  const habitRef = ref(database, `users/${userId}/habits/${habitId}/dates/${today}`);
  const snapshot = await get(habitRef);
  return snapshot.exists() && snapshot.val() > 0;
}

console.log(habitCompletedToday("habit1")); // true
