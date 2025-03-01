import { push, ref } from "firebase/database";
import { database, getUser } from "../firebase";

export async function storeFCMTokenToCurrentUser(newToken: string) {
  const user = await getUser();
  if (!user) {
    console.error("User not signed in");
    return;
  }
  try {
    await push(ref(database, `users/${user.uid}/fcmTokens`), newToken);
  } catch (error) {
    console.error("Error storing token:", error);
  }
}
