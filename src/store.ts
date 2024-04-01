import { atom, createStore } from "jotai";
import { fetchHabitById, fetchHabits } from "./habitsModel.tsx";

export const store = createStore();

export const habitsAtom = atom(async () => {
  const habits = await fetchHabits();
  return habits;
});

export const habitByIdAtom = (id: string) =>
  atom(async () => {
    console.log("fetching habit by id", id);

    const habit = await fetchHabitById(id);
    console.log("done");

    return habit;
  });
