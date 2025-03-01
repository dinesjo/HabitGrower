import { get, push, ref } from "firebase/database";
import { database, getUser } from "../firebase";

export async function storeFCMTokenToCurrentUser(newToken: string) {
  const user = await getUser();
  if (!user) {
    console.error("User not signed in");
    return;
  }
  try {
    const fcmTokensRef = ref(database, `users/${user.uid}/fcmTokens`);
    const snapshot = await get(fcmTokensRef);
    const fcmTokens = snapshot.val() || {};

    // Check if the token already exists
    const tokenExists = Object.values(fcmTokens).includes(newToken);
    if (!tokenExists) {
      await push(fcmTokensRef, newToken);
    } else {
      console.log("Token already exists, not storing duplicate.");
    }
  } catch (error) {
    console.error("Error storing token:", error);
  }
}
