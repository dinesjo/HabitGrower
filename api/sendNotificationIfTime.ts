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

    // Get all users
    const usersSnap = await db.ref("users").get();
    const users: RTDBUser[] = usersSnap.val();

    if (!users) {
      return res.status(200).json({ message: "No users found." });
    }

    const messages: admin.messaging.Message[] = [];
    const promises: Promise<string>[] = [];

    for (const user of Object.values(users)) {
      if (!user.fcmToken) continue; // Skip users without an FCM token

      for (const habit of Object.values(user.habits)) {
        if (habit.notificationEnabled && habit.notificationTime === currentTime) {
          promises.push(
            admin.messaging().send({
              token: user.fcmToken,
              notification: {
                title: habit.name,
              },
            })
          );
        }
      }
    }

    if (messages.length > 0) {
      await Promise.all(promises);
      res.status(200).json({
        success: true,
        message: messages.length + " notifications sent!",
      });
    } else {
      res.status(200).json({ message: "No notifications due." });
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
}
