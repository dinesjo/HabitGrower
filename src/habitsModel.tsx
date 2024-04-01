import { AutoStories, FitnessCenter, SelfImprovement, WaterDrop } from "@mui/icons-material";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: JSX.Element;
  frequency?: number;
  frequencyUnit?: "day" | "week" | "month";
  startDate?: Date;
  endDate?: Date;
  color?: string;
}

const database: Habit[] = [
  {
    id: "1",
    name: "Drink Water",
    description: "Drink 8 glasses of water every day",
    icon: <WaterDrop />,
    frequency: 8,
    frequencyUnit: "day",
    startDate: new Date("2022-01-01"),
    endDate: new Date("2022-12-31"),
    color: "blue",
  },
  {
    id: "2",
    name: "Exercise",
    description: "Exercise for 30 minutes",
    icon: <FitnessCenter />,
    color: "green",
  },
  {
    id: "3",
    name: "Read",
    description: "Read a book",
    icon: <AutoStories />,
    color: "orange",
  },
  {
    id: "4",
    name: "Meditate",
    description: "Meditate for 10 minutes",
    icon: <SelfImprovement />,
  },
];
export async function fetchHabits() {
  return new Promise<Habit[]>((resolve) => {
    setTimeout(() => {
      resolve(database);
    }, 700);
  });
}
export async function fetchHabitById(id: string) {
  return new Promise<Habit | undefined>((resolve) => {
    setTimeout(() => {
      resolve(database.find((habit) => habit.id === id));
    }, 700);
  });
}
