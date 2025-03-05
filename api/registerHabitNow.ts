import dayjs from "dayjs";
import admin from "firebase-admin";

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "https://habitgrower.web.app");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

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

async function handler(req, res) {
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

    const habitRef = db.ref(`users/${userId}/habits/${habitId}`);
    if (!(await habitRef.get()).exists()) {
      return res.status(404).json({ error: "Habit not found." });
    }
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

export default allowCors(handler);
