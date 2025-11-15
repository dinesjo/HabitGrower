import { PaletteMode } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { get, ref, set } from "firebase/database";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { database, getUser } from "./firebase";
import { fetchFcmToken } from "./services/fetchFcmToken";

export const store = getDefaultStore();
export const themeAtom = atomWithStorage<PaletteMode>("theme", "dark");

/* User config */
const userAtom = atom(async () => await getUser());
export const userDayStartsAtAtom = atomWithStorage<Dayjs | null>("", null, {
  getItem: async () => {
    const userId = (await store.get(userAtom))?.uid;
    return get(ref(database, "users/" + userId + "/dayStartsAt")).then((snapshot) => {
      if (snapshot.exists()) {
        return dayjs(snapshot.val());
      }
      return null;
    });
  },
  setItem: async (_, dayStartsAt) => {
    const userId = (await store.get(userAtom))?.uid;
    return set(ref(database, "users/" + userId + "/dayStartsAt"), dayStartsAt?.toISOString() || null);
  },
  removeItem: async () => {
    const userId = (await store.get(userAtom))?.uid;
    return set(ref(database, "users/" + userId + "/dayStartsAt"), null);
  },
});
export const userWeekStartsAtMondayAtom = atomWithStorage<boolean>("", false, {
  getItem: async () => {
    const userId = (await store.get(userAtom))?.uid;
    return get(ref(database, "users/" + userId + "/weekStartsAtMonday")).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return false;
    });
  },
  setItem: async (_, weekStartsAtMonday) => {
    const userId = (await store.get(userAtom))?.uid;
    return set(ref(database, "users/" + userId + "/weekStartsAtMonday"), weekStartsAtMonday);
  },
  removeItem: async () => {
    const userId = (await store.get(userAtom))?.uid;
    return set(ref(database, "users/" + userId + "/weekStartsAtMonday"), null);
  },
});

/* Snackbar */
const snackbarMessagePrimitiveAtom = atom<string>("");
export const snackbarMessageAtom = atom(
  (get) => get(snackbarMessagePrimitiveAtom),
  (_, set, message: string) => {
    set(snackbarMessagePrimitiveAtom, message);
  }
);
const snackbarSeverityPrimitiveAtom = atom<"success" | "error" | "warning" | "info">("info");
export const snackbarSeverityAtom = atom(
  (get) => get(snackbarSeverityPrimitiveAtom),
  (_, set, severity: "success" | "error" | "warning" | "info") => {
    set(snackbarSeverityPrimitiveAtom, severity);
  }
);
const snackbarActionPrimitiveAtom = atom<React.JSX.Element | undefined>(undefined);
export const snackbarActionAtom = atom(
  (get) => get(snackbarActionPrimitiveAtom),
  (_, set, action: React.JSX.Element | undefined) => {
    set(snackbarActionPrimitiveAtom, action);
  }
);
export const snackbarOpenAtom = atom<boolean>((get) => !!get(snackbarMessageAtom));

/* Habits */
export const checkedHabitIdsAtom = atom<string[]>([]);

/* Notifications */
// Safely get notification permission, fallback to 'default' if Notification API not available
const initialNotificationPermission = (typeof Notification !== 'undefined' && Notification.permission) || 'default';
const notificationPermissionPrimitiveAtom = atom<NotificationPermission>(initialNotificationPermission);
export const notificationPermissionAtom = atom(
  (get) => get(notificationPermissionPrimitiveAtom),
  (_, set, permission: NotificationPermission) => {
    set(notificationPermissionPrimitiveAtom, permission);
    if (permission === "granted") {
      fetchFcmToken();
    }
  }
);

/* Days shown in the graph */
export const daysShownAtom = atomWithStorage<number>("daysShown", 30);

/* Graph frequency unit (day/week/month aggregation) */
export const graphFrequencyUnitAtom = atomWithStorage<"day" | "week" | "month">("graphFrequencyUnit", "day");
