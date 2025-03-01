import { Habit } from "./Habit";

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
