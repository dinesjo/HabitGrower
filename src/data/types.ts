import type { Habit } from "../types/Habit";

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Preferences {
  dayStartsAt: string | null;
  weekStartsAtMonday: boolean;
}

export interface AppBackend {
  getUser(): Promise<AppUser | null>;
  subscribeUser(onChange: (user: AppUser | null) => void, onError: (error: Error) => void): () => void;
  signOut(): Promise<void>;
  fetchAllHabits(): Promise<Habit[]>;
  fetchHabitById(id: string): Promise<Habit | undefined>;
  createEmptyHabit(): Promise<string>;
  updateHabit(id: string, habit: Habit): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  registerHabitsNow(ids: string[]): Promise<void>;
  unregisterHabitByDate(id: string, date: string): Promise<void>;
  readPreference<K extends keyof Preferences>(key: K): Promise<Preferences[K]>;
  writePreference<K extends keyof Preferences>(key: K, value: Preferences[K]): Promise<void>;
  fetchFcmToken(): void;
  resetDemoData(): Promise<void>;
}
