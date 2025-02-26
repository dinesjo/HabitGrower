import { Habit } from "../habitsModel";
import { showSnackBar } from "../utils/helpers";

/**
 * Request permission to show notifications. Shows a snackbar with the result.
 *
 * @returns true if permission was granted, false otherwise
 */
async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!("Notification" in window)) {
      showSnackBar("This browser does not support push notifications", "warning");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      showSnackBar("Notifications enabled!", "success");
      return true;
    } else {
      showSnackBar("Notifications were denied. Enable them in your browser settings to receive reminders.", "warning");
      return false;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    showSnackBar("Failed to setup notifications", "error");
    return false;
  }
}

/**
 * Schedule a notification for the given habit.
 *
 * @param habit Habit to schedule a notification for
 */
async function scheduleHabitNotification(habit: Habit) {
  if (!habit.notificationEnabled || !habit.notificationTime || !habit.id) return;

  const registration = await navigator.serviceWorker.ready;
  const activeWorker = registration.active;

  if (!activeWorker) {
    console.error("No active service worker found");
    return;
  }

  activeWorker.postMessage({
    type: "schedule-notification",
    detail: {
      habitId: habit.id,
      title: `Time to do: ${habit.name}`,
      time: habit.notificationTime,
    },
  });
}

/**
 * Update notifications for all habits that have notifications enabled.
 *
 * Works by requests notification permission and schedules notifications for all given habits.
 *
 * @param habits Habits to schedule notifications for
 * @returns Promise that resolves when all notifications are scheduled
 */
export async function updateHabitNotifications(habits: Habit[]): Promise<void> {
  const permission = await requestNotificationPermission();
  if (!permission) return;

  for (const habit of habits) {
    await scheduleHabitNotification(habit);
  }
}
