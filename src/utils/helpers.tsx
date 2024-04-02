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
 * Calculates the progress of a habit based on the completed dates.
 * @param habit - The habit object.
 * @returns The progress percentage of the habit.
 */
export function getProgress(habit: Habit) {
  if (!habit.frequency || !habit.frequencyUnit || !habit.dates) {
    return 0;
  }

  const chosenStartString = getChosenStartString(habit.frequencyUnit);
  const completedDates = Object.keys(habit.dates).filter((date) => date >= chosenStartString);
  return (completedDates.length / habit.frequency) * 100;
}

/**
 * Calculates the progress buffer of a habit based on the last completed date and the habit's frequency.
 * @param habit - The habit object.
 * @returns  The progress buffer percentage of the habit.
 */
export function getProgressBuffer(habit: Habit) {
  if (!habit.frequency || !habit.frequencyUnit) {
    return 0;
  }

  const chosenStartString = getChosenStartString(habit.frequencyUnit);
  const daysSinceStart = Math.floor((Date.now() - new Date(chosenStartString).getTime()) / (1000 * 60 * 60 * 24));
  return (daysSinceStart / maxDaysFromFrequencyUnit(habit.frequencyUnit)) * 100;
}
