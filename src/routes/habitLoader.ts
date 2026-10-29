import type { LoaderFunctionArgs } from "react-router-dom";
import { fetchHabitById } from "../services/habitsPersistance";

// Keep the data loader small so it can run alongside the screen download.
export async function habitLoader({ params }: LoaderFunctionArgs) {
  if (!params.id) return null;
  const habit = await fetchHabitById(params.id);
  if (!habit) throw new Response("Habit not found", { status: 404, statusText: "Habit not found" });
  return { habit };
}
