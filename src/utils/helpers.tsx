import dayjs from "dayjs";
import { Habit } from "../habitsModel";

/**
 * Converts a string to a friendly format by adding spaces before capital letters and capitalizing the first letter.
 * @param str - The string to convert.
 * @returns The converted string.
 */
export function toFriendlyString(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Converts a habit's frequency and frequency unit to a friendly string representation.
 * @param habit - The habit object.
 * @returns The friendly string representation of the habit's frequency.
 */
export function toFriendlyFrequency(habit: Habit) {
  if (!habit.frequency || !habit.frequencyUnit) {
    return "";
  }
  return `${habit.frequency === 1 ? "Once" : `${habit.frequency} times`} a ${habit.frequencyUnit}`;
}

function getFrequencyUnitStart(frequencyUnit: string) {
  // Day, should be todays date in UTC
  const todayStart = dayjs().startOf("day");
  // Week
  const weekStart = dayjs().startOf("week"); // FIXME: slightly off
  // Month
  const monthStart = dayjs().startOf("month");

  let chosenStart = todayStart;
  if (frequencyUnit === "day") {
    chosenStart = todayStart;
  } else if (frequencyUnit === "week") {
    chosenStart = weekStart;
  } else if (frequencyUnit === "month") {
    chosenStart = monthStart;
  }

  return chosenStart;
}

/**
 * Calculates the progress of a habit based on its dates property.
 * @param habit - The habit object.
 * @param isChecked - Whether the habit is checked or not (+1 date).
 * @returns The progress percentage of the habit (0-100).
 */
export function getProgress(habit: Habit, isChecked: boolean) {
  if (!habit.frequency || !habit.frequencyUnit) {
    return 0;
  }

  const frequencyUnitStart = getFrequencyUnitStart(habit.frequencyUnit);

  // Count the number of completed dates after the chosen start date
  let completedDates = Number(isChecked);
  if (habit.dates) {
    completedDates += Object.keys(habit.dates).reduce((acc, date) => {
      if (dayjs(date).isAfter(frequencyUnitStart)) {
        return acc + Number(habit.dates![date]); // habit.dates![date] is true
      }
      return acc;
    }, 0);
  }

  return Math.min((completedDates / habit.frequency) * 100, 100);
}

/**
 * Calculates the progress buffer of a habit based on the frequency unit.
 * @param habit - The habit object.
 * @returns  The progress buffer percentage of the habit (0-100).
 */
export function getProgressBuffer(habit: Habit, dayStartsAt: dayjs.Dayjs | null = null) {
  if (!habit.frequency || !habit.frequencyUnit) {
    return 0;
  }

  const hour = dayStartsAt?.hour() || 0;
  const minutes = dayStartsAt?.minute() || 0;

  const start = getFrequencyUnitStart(habit.frequencyUnit);
  const adjustedStart = start.add(hour, "hour").add(minutes, "minute");

  const daysElapsed = dayjs().diff(adjustedStart, "hours") / 24;
  const maxDays = dayjs().endOf(habit.frequencyUnit).diff(adjustedStart, "hours") / 24;

  return Math.min((daysElapsed / maxDays) * 100, 100);
}
