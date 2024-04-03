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

function firstDayOfWeek(dateObject: Date, firstDayOfWeekIndex: number = 0) {
  const dayOfWeek = dateObject.getDay(),
    firstDayOfWeek = new Date(dateObject),
    diff = dayOfWeek >= firstDayOfWeekIndex ? dayOfWeek - firstDayOfWeekIndex : 6 - dayOfWeek;

  firstDayOfWeek.setDate(dateObject.getDate() - diff);
  firstDayOfWeek.setHours(0, 0, 0, 0);

  return firstDayOfWeek;
}

function getChosenStartString(frequencyUnit: string) {
  // Day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartString = todayStart.toISOString().split("T")[0];
  // Week
  const weekStartString = firstDayOfWeek(new Date(), 1).toISOString().split("T")[0];
  // Month
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);
  const monthStartString = monthStart.toISOString().split("T")[0];

  let chosenStartString = "";
  if (frequencyUnit === "day") {
    chosenStartString = todayStartString;
  } else if (frequencyUnit === "week") {
    chosenStartString = weekStartString;
  } else if (frequencyUnit === "month") {
    chosenStartString = monthStartString;
  }

  return chosenStartString;
}

function maxDaysFromFrequencyUnit(frequencyUnit: string) {
  if (frequencyUnit === "day") {
    return 1;
  } else if (frequencyUnit === "week") {
    return 7;
  } else if (frequencyUnit === "month") {
    return 30;
  }
  return -1;
}

/**
 * Calculates the progress of a habit based on its dates property.
 * @param habit - The habit object.
 * @param isChecked - Whether the habit is checked or not (+1 date).
 * @returns The progress percentage of the habit.
 */
export function getProgress(habit: Habit, isChecked: boolean) {
  if (!habit.frequency || !habit.frequencyUnit) {
    return 0;
  }

  const chosenStartString = getChosenStartString(habit.frequencyUnit);
  // Count the number of completed dates after the chosen start date
  let completedDates = Number(isChecked);
  if (habit.dates) {
    completedDates += Object.keys(habit.dates).reduce((acc, date) => {
      if (new Date(date) >= new Date(chosenStartString)) {
        return acc + habit.dates![date];
      }
      return acc;
    }, 0);
  }

  return Math.min((completedDates / habit.frequency) * 100, 100);
}

/**
 * Calculates the progress buffer of a habit based on the frequency unit.
 * @param habit - The habit object.
 * @returns  The progress buffer percentage of the habit.
 */
export function getProgressBuffer(habit: Habit) {
  if (!habit.frequency || !habit.frequencyUnit) {
    return 0;
  }

  const chosenStartString = getChosenStartString(habit.frequencyUnit);
  const daysSinceStart = (Date.now() - new Date(chosenStartString).getTime()) / (1000 * 60 * 60 * 24);
  // - 1 below is to prevent the progress buffer from reaching 100% before the end of the day,
  // so it's accurate throughout the day.
  return Math.min((daysSinceStart - 1 / maxDaysFromFrequencyUnit(habit.frequencyUnit)) * 100, 100);
}
