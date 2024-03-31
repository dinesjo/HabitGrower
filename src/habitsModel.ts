import { atom } from "jotai";

export interface Habit {
  name: string;
  description?: string;
  frequency?: number;
  frequencyUnit?: "day" | "week" | "month";
  startDate?: Date;
  endDate?: Date;
}

export async function fetchHabits() {
  return testdata;
}
