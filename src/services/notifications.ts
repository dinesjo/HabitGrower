import { Habit } from "../habitsModel";
import { showSnackBar } from "../utils/helpers";

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // First, check if notifications are supported
    if (!("Notification" in window)) {
      showSnackBar("This browser does not support notifications", "error");
      return false;
    }

    // Check if we already have permission
    if (Notification.permission === "granted") {
      return true;
    }

    // Request permission
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

export async function scheduleHabitNotification(habit: Habit) {
  if (!habit.notificationEnabled || !habit.notificationTime || !habit.id) return;

  if (Notification.permission !== "granted") {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  }

  const registration = await navigator.serviceWorker.ready;
  const activeWorker = registration.active;

  if (!activeWorker) {
    console.error("No active service worker found");
    return;
  }

  console.log("Dispatching event to service worker");
  activeWorker.postMessage({
    type: "schedule-notification",
    detail: {
      habitId: habit.id,
      title: `Time to do: ${habit.name}`,
      time: habit.notificationTime,
    },
  });
}

export async function updateHabitNotifications(habits: Habit[]) {
  // Request permission first
  const permission = await requestNotificationPermission();
  if (!permission) return;

  // Schedule notifications for all enabled habits
  for (const habit of habits) {
    await scheduleHabitNotification(habit);
  }
}
