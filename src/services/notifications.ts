import { Habit } from "../habitsModel";

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function scheduleHabitNotification(habit: Habit) {
  if (!habit.notificationTime) return;

  const registration = await navigator.serviceWorker.ready;

  // Create a notification schedule event
  registration.dispatchEvent(
    new CustomEvent("schedule-notification", {
      detail: {
        habitId: habit.id,
        title: `Time to do: ${habit.name}`,
        time: habit.notificationTime,
      },
    })
  );
}

export async function updateHabitNotifications(habits: Habit[]) {
  const permission = await requestNotificationPermission();
  if (!permission) return;

  habits.forEach((habit) => {
    scheduleHabitNotification(habit);
  });
}
