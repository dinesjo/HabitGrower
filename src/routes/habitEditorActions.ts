import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { createHabit, updateHabit } from "../services/habitsPersistance";
import type { Habit } from "../types/Habit";
import { showSnackBar } from "../utils/helpers";

export function newHabitLoader() {
  return { habit: { id: "", name: "", icon: "Default", notificationEnabled: false } satisfies Habit };
}

export async function saveHabitAction({ params, request }: ActionFunctionArgs) {
  const formData = Object.fromEntries(await request.formData());
  const habitData = formData as unknown as Habit;
  habitData.notificationEnabled = formData.notificationEnabled === "on";
  try {
    if (params.id) await updateHabit(params.id, habitData);
    else await createHabit(habitData);
  } catch {
    return { error: "Couldn't save this habit. Please try again." };
  }
  showSnackBar(params.id ? "Habit updated!" : "Habit created!", "success");
  return redirect("/");
}
