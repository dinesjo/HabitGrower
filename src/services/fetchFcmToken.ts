import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import { storeFCMTokenToCurrentUser } from "./fcmTokenPersistance";

export const fetchFcmToken = () => {
  // Check if messaging is available (may be null on iOS Safari)
  if (!messaging) {
    console.log('Firebase messaging not available on this device/browser');
    return;
  }

  getToken(messaging, {
    vapidKey: "BGrAALqbXgLxsAQlzzQ5CSU7xOgYCYdHAHm4zbLT4Zs0rxUTpAR7JGLOZhFH1Qq6w1zGoQLZHLKXXDMelJv5PGY",
  })
    .then((token) => {
      storeFCMTokenToCurrentUser(token);
      console.log("FCM token:", token);
    })
    .catch((error) => {
      console.error("Error getting FCM token:", error);
    });
};
