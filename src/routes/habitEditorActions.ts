import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createHabit, updateHabit } from "../services/habitsPersistance";
import type { Habit } from "../types/Habit";
import { showSnackBar } from "../utils/helpers";
import { HabitGoalValidationError, normalizeHabitGoal, type HabitGoalErrors } from "../utils/habitGoal";

export interface HabitEditorActionData {
  error?: string;
  fieldErrors?: HabitGoalErrors;
}

export function newHabitLoader() {
  return { habit: { id: "", name: "", icon: "Default", notificationEnabled: false } satisfies Habit };
}

export async function saveHabitAction({ params, request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData());
  const habitData = formData as unknown as Habit;
  habitData.notificationEnabled = formData.notificationEnabled === "on";
  try {
    const normalized = { ...habitData, ...normalizeHabitGoal(habitData) };
    if (params.id) await updateHabit(params.id, normalized);
    else await createHabit(normalized);
  } catch (error) {
    if (error instanceof HabitGoalValidationError) return { fieldErrors: error.fieldErrors } satisfies HabitEditorActionData;
    return { error: "Couldn't save this habit. Please try again." };
  }
  showSnackBar(params.id ? "Habit updated!" : "Habit created!", "success");
  return redirect("/");
}
