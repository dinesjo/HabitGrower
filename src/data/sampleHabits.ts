import type { Habit } from "../types/Habit";

export function createSampleHabits(now = new Date()): Habit[] {
  const history = (skipEvery: number, hour: number, count = 1): NonNullable<Habit["dates"]> => {
    const dates: NonNullable<Habit["dates"]> = {};
    for (let daysAgo = 1; daysAgo <= 90; daysAgo++) {
      if (daysAgo % skipEvery === 0) continue;
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(hour, 0, 0, 0);
      dates[date.toISOString().split(".")[0] + "Z"] = count;
    }
    return dates;
  };

  const recent = new Date(now.getTime() - 60_000).toISOString().split(".")[0] + "Z";
  return [
    { id: "demo-reading", name: "Read a few pages", description: "Make time for a good book.", icon: "AutoStories", color: "SteelBlue", frequency: 1, frequencyUnit: "day", dates: { ...history(5, 20), [recent]: 1 }, notificationEnabled: false },
    { id: "demo-walking", name: "Go for a walk", description: "Get outside and enjoy some fresh air.", icon: "NordicWalking", color: "MediumSeaGreen", frequency: 4, frequencyUnit: "week", dates: history(3, 12), notificationEnabled: false },
    { id: "demo-water", name: "Drink water", description: "A glass of water, three times a day.", icon: "WaterDrop", color: "SkyBlue", frequency: 3, frequencyUnit: "day", dates: { ...history(7, 9, 3), [recent]: 1 }, notificationEnabled: false },
    { id: "demo-music", name: "Practice music", description: "A little practice goes a long way.", icon: "Music", color: "SandyBrown", frequency: 8, frequencyUnit: "month", dates: history(2, 18), notificationEnabled: false },
    { id: "demo-stretching", name: "Stretch for five minutes", description: "Start a new routine today.", icon: "SelfImprovement", color: "PaleVioletRed", frequency: 1, frequencyUnit: "day", notificationEnabled: false },
  ];
}
