import admin from "firebase-admin";
import { RTDBUser } from "../src/types/RTDBUser";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
    databaseURL: "https://habitgrower-default-rtdb.europe-west1.firebasedatabase.app",
  });
}

const db = admin.database();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`; // "HH:MM"

    const usersSnapshot = await db.ref("users").once("value");
    const usersIds = usersSnapshot.val();

    if (!usersIds) {
      return res.status(200).json({ message: "No users found." });
    }

    const messages: admin.messaging.Message[] = [];

    for (const userId in usersIds) {
      const user: RTDBUser = usersIds[userId];
      if (!user.fcmToken) continue; // Skip users without an FCM token

      for (const habitId in user.habits) {
        const habit = user.habits[habitId];
        if (habit.notificationEnabled && habit.notificationTime === currentTime) {
          messages.push({
            token: user.fcmToken,
            notification: {
              title: habit.name,
              body: `Time to do: ${habit.name}`,
            },
          });
        }
      }
    }

    if (messages.length > 0) {
      await Promise.all(messages.map((msg) => admin.messaging().send(msg)));
      res.status(200).json({
        success: true,
        message: "Notifications sent! " + messages.map((msg) => msg.notification!.body).join(", "),
      });
    } else {
      res.status(200).json({ message: "No notifications due." });
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
}
