import dayjs from "dayjs";
import admin from "firebase-admin";
import { Habit } from "../src/types/Habit";
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

  const bypass = req.query.bypass as string | undefined;

  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`; // "HH:MM"

    // Get all users
    const usersSnap = await db.ref("users").get();
    const users: RTDBUser[] = usersSnap.val();

    if (!users) {
      return res.status(200).json({ message: "No users found." });
    }

    const promises: Promise<string | void>[] = [];

    for (const [userId, user] of Object.entries(users)) {
      if (!user.fcmTokens) continue; // Skip users without an FCM token

      for (const [fcmTokenKey, fcmToken] of Object.entries(user.fcmTokens)) {
        for (const [habitId, habit] of Object.entries(user.habits)) {
          const habitProgressPercent = getProgress(habit, false, user.weekStartsAtMonday || false);
          const habitComplete = habitProgressPercent >= 100;

          if (habit.notificationEnabled && (bypass || (!habitComplete && habit.notificationTime === currentTime))) {
            promises.push(
              admin
                .messaging()
                .send({
                  token: fcmToken,
                  data: {
                    title: habit.name,
                    progressPercent: String(habitProgressPercent.toFixed(0)),
                    frequencyUnit: habit.frequencyUnit || "",
                    habitId: habitId,
                    userId: userId,
                  },
                })
                .catch(async (error) => {
                  if (error.code === "messaging/registration-token-not-registered") {
                    console.warn("Removing invalid FCM token:", fcmToken);
                    await db.ref(`users/${userId}/fcmTokens/${fcmTokenKey}`).remove();
                  }
                })
            );
          }
        }
      }
    }

    if (promises.length > 0) {
      const results = await Promise.allSettled(promises);
      const successfulCount = results.filter((result) => result.status === "fulfilled").length;
      res.status(201).json({
        message: successfulCount + " notifications sent!",
      });
    } else {
      res.status(200).json({ message: "No notifications due." });
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
}

/*
 * COPIED FROM src/utils/helpers.ts
 */
function getFrequencyUnitStart(frequencyUnit: string, userWeekStartsAtMonday: boolean | null) {
  // Day, should be todays date in UTC
  const todayStart = dayjs().startOf("day");
  // Week
  let weekStart = dayjs().startOf("week").add(Number(userWeekStartsAtMonday), "day");
  if (userWeekStartsAtMonday && dayjs().day() === 0) {
    // edge case for Sunday and userWeekStartsAtMonday
    weekStart = weekStart.subtract(1, "week");
  }
  // Month
  const monthStart = dayjs().startOf("month");

  let chosenStart = todayStart;
  if (frequencyUnit === "day") {
    chosenStart = todayStart;
  } else if (frequencyUnit === "week") {
    chosenStart = weekStart;
  } else if (frequencyUnit === "month") {
    chosenStart = monthStart;
  }

  return chosenStart;
}

function getProgress(habit: Habit, isChecked: boolean, userWeekStartsAtMonday: boolean) {
  if (!habit.frequency || !habit.frequencyUnit) {
    return 0;
  }

  const frequencyUnitStart = getFrequencyUnitStart(habit.frequencyUnit, userWeekStartsAtMonday);

  // Count the number of completed dates after the chosen start date
  let completedDates = Number(isChecked);
  if (habit.dates) {
    completedDates += Object.keys(habit.dates).reduce((acc, date) => {
      if (dayjs(date).isAfter(frequencyUnitStart)) {
        return acc + Number(habit.dates![date]); // habit.dates![date] is true or 1
      }
      return acc;
    }, 0);
  }

  return Math.min((completedDates / habit.frequency) * 100, 100);
}
