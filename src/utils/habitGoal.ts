import type { Habit } from "../types/Habit";
import type { FrequencyUnit } from "../types/FrequencyUnit";

type GoalInput = { frequency?: unknown; frequencyUnit?: unknown };
export type HabitGoalErrors = Partial<Record<"frequency" | "frequencyUnit", string>>;

function isEmpty(value: unknown) {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

export function validateHabitGoal({ frequency, frequencyUnit }: GoalInput): HabitGoalErrors {
  const errors: HabitGoalErrors = {};
  const hasCount = !isEmpty(frequency);
  const hasPeriod = !isEmpty(frequencyUnit);
  const count = typeof frequency === "number" || typeof frequency === "string" ? Number(frequency) : NaN;
  if (hasCount && (!Number.isSafeInteger(count) || count < 1)) {
    errors.frequency = "Enter a whole number of at least 1.";
  } else if (!hasCount && hasPeriod) {
    errors.frequency = "Enter how many times you want to do this.";
  }
  if ((hasPeriod && (typeof frequencyUnit !== "string" || !["day", "week", "month"].includes(frequencyUnit))) || (hasCount && !hasPeriod)) {
    errors.frequencyUnit = "Choose a day, week, or month.";
  }
  return errors;
}

export class HabitGoalValidationError extends Error {
  constructor(public fieldErrors: HabitGoalErrors) {
    super("Check your habit goal.");
    this.name = "HabitGoalValidationError";
  }
}

export function normalizeHabitGoal(input: GoalInput): Pick<Habit, "frequency" | "frequencyUnit"> {
  const errors = validateHabitGoal(input);
  if (Object.keys(errors).length) throw new HabitGoalValidationError(errors);
  return {
    frequency: isEmpty(input.frequency) ? undefined : Number(input.frequency),
    frequencyUnit: isEmpty(input.frequencyUnit) ? undefined : input.frequencyUnit as FrequencyUnit,
  };
}
