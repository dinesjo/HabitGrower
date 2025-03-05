import dayjs from "dayjs";
import admin from "firebase-admin";

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

  if (!req.query.userId || !req.query.habitId) {
    return res.status(400).json({ error: "Missing parameters." });
  }

  const { userId, habitId } = req.query as { userId: string; habitId: string[] };

  try {
    const today = dayjs();
    const todayString = today.toISOString().split(".")[0] + "Z"; // +Z for UTC

    const todayRef = db.ref(`users/${userId}/habits/${habitId}/dates/${todayString}`);
    const currentCount = await todayRef
      .get()
      .then((snapshot) => Number(snapshot.val()) || 0)
      .catch(() => 0);
    await todayRef.set(currentCount + 1);
    return res.status(200).json({ message: "Habit registered." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
