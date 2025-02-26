import { Habit } from "../habitsModel";

export interface RTDBUser {
  dayStartsAt: string | undefined;
  fcmToken: string | undefined;
  habits: {
    [key: string]: Habit;
  };
  weekStartsAtMonday: boolean | undefined;
}
