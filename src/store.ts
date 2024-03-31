import { atom, createStore } from "jotai";
import { Habit, fetchHabits } from "./habitsModel";

export const store = createStore();
const testdata: Habit[] = [
  {
    name: "Drink Water",
    description: "Drink 8 glasses of water every day",
    frequency: 8,
    frequencyUnit: "day",
  },
  {
    name: "Exercise",
    description: "Exercise for 30 minutes",
  },
  {
    name: "Read",
    description: "Read a book",
  },
  {
    name: "Meditate",
    description: "Meditate for 10 minutes",
  },
];
export const habits = atom<Habit[]>(testdata);
const habitAtom = atom(
  async (get) => {
    const habits = await fetchHabits();
    return habits;
  },
  async (get, set, newHabits: Habit[]) => {
    set(habits, newHabits);
  }
);
