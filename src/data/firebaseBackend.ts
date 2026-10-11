import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, ref, set } from "firebase/database";
import { database, getUser } from "../firebase";
import { fetchFcmToken } from "./firebaseFcmToken";
import * as habits from "./firebaseHabits";
import type { AppBackend, Preferences } from "./types";

const defaultPreferences: Preferences = { dayStartsAt: null, weekStartsAtMonday: false };

export const firebaseBackend: AppBackend = {
  ...habits,
  getUser,
  subscribeUser(onChange, onError) { return onAuthStateChanged(getAuth(), onChange, onError); },
  async signOut() { await getAuth().signOut(); },
  async readPreference(key) {
    const user = await getUser();
    const fallback = defaultPreferences[key];
    if (!user) return fallback;
    const snapshot = await get(ref(database, `users/${user.uid}/${key}`));
    return snapshot.exists() ? snapshot.val() : fallback;
  },
  async writePreference(key, value) {
    const user = await getUser();
    if (!user) return;
    await set(ref(database, `users/${user.uid}/${key}`), value);
  },
  fetchFcmToken,
  async resetDemoData() { throw new Error("Demo reset is only available in local mode."); },
};
