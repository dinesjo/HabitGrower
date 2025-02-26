import { get, push, ref, set } from "firebase/database";
import { database, getUser } from "../firebase";

export async function storeFCMTokenToCurrentUser(newToken: string) {
  const user = await getUser();
  if (!user) {
    console.error("User not signed in");
    return;
  }
  try {
    const userFcmTokensRef = ref(database, `users/${user.uid}/fcmTokens`);
    const snapshot = await get(userFcmTokensRef);
    const tokens = snapshot.val() || {};

    if (!Object.values(tokens).includes(newToken)) {
      const newFcmTokenRef = push(userFcmTokensRef);
      await set(newFcmTokenRef, newToken);
      console.log("New token stored:", newToken);
    } else {
      console.log("Token already exists:", newToken);
    }
  } catch (error) {
    console.error("Error storing token:", error);
  }
}
