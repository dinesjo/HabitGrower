// This comment tells Workbox where to inject the manifest
// self.__WB_MANIFEST

console.log('Service worker loaded');

// Create a Map to store active notification timeouts by habit ID
const activeNotifications = new Map();

self.addEventListener('install', () => {
  console.log('Service worker installed');
});

self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'icon.png',
    badge: 'badge.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const habitId = event.notification.data?.habitId;
  if (habitId) {
    event.waitUntil(
      self.clients.openWindow(`https://habitgrower.web.app/${habitId}`)
    );
  }
});

self.addEventListener('message', function (event) {
  console.log('Received message in SW:', event.data);

  if (event.data.type === 'schedule-notification') {
    const { habitId, title, time } = event.data.detail;

    // Cancel any existing notification for this habit
    if (activeNotifications.has(habitId)) {
      const { timeoutId } = activeNotifications.get(habitId);
      clearTimeout(timeoutId);
      activeNotifications.delete(habitId);
      console.log('Cancelled existing notification for habit:', habitId);
    }

    // Convert time (HH:mm) to next occurrence
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setUTCHours(hours, minutes, 0, 0);

    // If time has passed for today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log(`Scheduling notification for habit ${habitId} at:`, scheduledTime.toISOString());

    // Schedule new notification
    const timeoutId = setTimeout(async () => {
      try {
        console.log('Notification time reached for habit:', habitId);
        await self.registration.showNotification(title, {
          body: "Don't forget to complete your habit today!",
          icon: 'icon.png',
          badge: 'badge.png',
          data: { habitId },
          tag: habitId // Ensure only one notification is shown per habit
        });
        console.log('Notification shown for habit:', habitId);
      } catch (error) {
        console.error('Error showing notification:', error);
      } finally {
        // Remove from active notifications and schedule next day's notification
        activeNotifications.delete(habitId);
        // Reschedule for tomorrow
        self.dispatchEvent(new MessageEvent('message', {
          data: {
            type: 'schedule-notification',
            detail: { habitId, title, time }
          }
        }));
      }
    }, scheduledTime.getTime() - now.getTime());

    // Store the notification details
    activeNotifications.set(habitId, {
      timeoutId,
      scheduledTime,
      title
    });
  }

  // Add handler for canceling notifications
  if (event.data.type === 'cancel-notification') {
    const { habitId } = event.data;
    if (activeNotifications.has(habitId)) {
      const { timeoutId } = activeNotifications.get(habitId);
      clearTimeout(timeoutId);
      activeNotifications.delete(habitId);
      console.log('Cancelled notification for habit:', habitId);
    }
  }
});

self.addEventListener('activate', function (event) {
  console.log('Service worker activated');
  event.waitUntil(
    (async () => {
      const now = new Date();
      // Clean up expired notifications
      for (const [habitId, notification] of activeNotifications.entries()) {
        if (notification.scheduledTime < now) {
          clearTimeout(notification.timeoutId);
          activeNotifications.delete(habitId);
        }
      }
    })()
  );
});