import { ref, set } from "firebase/database";
import { database, getUser } from "../firebase";

export async function storeFCMTokenToCurrentUser(token: string) {
  const user = await getUser();
  if (!user) {
    console.error("User not signed in");
    return;
  }
  const db = database;
  try {
    await set(ref(db, `users/${user.uid}/fcmToken`), token);
    console.log("Token stored:", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
}
