import { PaletteMode } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { getBackend } from "./data/backend";
import { isLocalMode } from "./data/mode";
import { fetchFcmToken } from "./services/fetchFcmToken";

export const store = getDefaultStore();
export const themeAtom = atomWithStorage<PaletteMode>("theme", "dark");

/* User config */
export const userDayStartsAtAtom = atomWithStorage<Dayjs | null>("", null, {
  getItem: async () => {
    const value = await (await getBackend()).readPreference("dayStartsAt");
    return value ? dayjs(value) : null;
  },
  setItem: async (_, value) => (await getBackend()).writePreference("dayStartsAt", value?.toISOString() || null),
  removeItem: async () => (await getBackend()).writePreference("dayStartsAt", null),
});
export const userWeekStartsAtMondayAtom = atomWithStorage<boolean>("", false, {
  getItem: async () => (await getBackend()).readPreference("weekStartsAtMonday"),
  setItem: async (_, value) => (await getBackend()).writePreference("weekStartsAtMonday", value),
  removeItem: async () => (await getBackend()).writePreference("weekStartsAtMonday", false),
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
const initialNotificationPermission = !isLocalMode && typeof Notification !== 'undefined' ? Notification.permission : 'default';
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
