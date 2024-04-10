import { PaletteMode } from "@mui/material";
import { database, getUser } from "./firebase";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { get, ref, set } from "firebase/database";
import dayjs, { Dayjs } from "dayjs";

export const store = getDefaultStore();
export const themeAtom = atomWithStorage<PaletteMode>("theme", "dark");
const userAtom = atom(async () => await getUser());
export const userDayStartsAtAtom = atomWithStorage<Dayjs | null>(
  "",
  null,
  {
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
  },
  {
    getOnInit: true,
  }
);

// Snackbar
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
export const snackbarOpenAtom = atom<boolean>((get) => !!get(snackbarMessageAtom));

// Checked habits
export const checkedHabitIdsAtom = atom<string[]>([]);
