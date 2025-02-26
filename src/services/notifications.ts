import { ref, set } from "firebase/database";
import { getToken } from "firebase/messaging";
import { database, getUser, messaging } from "../firebase";
import { showSnackBar } from "../utils/helpers";

async function storeFCMTokenToCurrentUser(token: string) {
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

/**
 * Request permission to show notifications. Shows a snackbar with the result.
 *
 * @returns true if permission was granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!("Notification" in window)) {
      showSnackBar("This browser does not support push notifications", "warning");
      return false;
    }

    //? Just update FCM token if already have permission
    // if (Notification.permission === "granted") {
    //   return true;
    // }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: "BGrAALqbXgLxsAQlzzQ5CSU7xOgYCYdHAHm4zbLT4Zs0rxUTpAR7JGLOZhFH1Qq6w1zGoQLZHLKXXDMelJv5PGY",
        });
        console.log("FCM Token:", token);
        storeFCMTokenToCurrentUser(token);
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
      showSnackBar("Notifications enabled!", "success");
      return true;
    } else {
      showSnackBar("Notifications were denied. Enable them in your browser settings to receive reminders.", "warning");
      return false;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    showSnackBar("Failed to setup notifications", "error");
    return false;
  }
}
