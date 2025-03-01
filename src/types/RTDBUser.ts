import { Habit } from "../habitsModel";

export interface RTDBUser {
  dayStartsAt?: string;
  fcmTokens?: {
    [key: string]: string;
  };
  habits: {
    [key: string]: Habit;
  };
  weekStartsAtMonday?: boolean;
}
