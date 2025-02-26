import { Habit } from "../habitsModel";

export interface RTDBUser {
  dayStartsAt: string | undefined;
  fcmTokens: {
    [key: string]: string;
  };
  habits: {
    [key: string]: Habit;
  };
  weekStartsAtMonday: boolean | undefined;
}
