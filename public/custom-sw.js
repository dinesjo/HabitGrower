console.log('Service worker loaded');

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

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const habitId = event.notification.data?.habitId;
  if (habitId) {
    event.waitUntil(
      self.clients.openWindow(`https://habitgrower.web.app/${habitId}`)
    );
  }
});

self.addEventListener('message', function(event) {
  console.log('Received message in SW:', event.data);
  
  if (event.data.type === 'schedule-notification') {
    const { habitId, title, time } = event.data.detail;

    // Convert time (HH:mm) to next occurrence
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setUTCHours(hours, minutes, 0, 0);

    // If time has passed for today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log('Scheduling notification for:', scheduledTime.toISOString());

    const notificationId = `habit_${habitId}_${scheduledTime.toISOString()}`;

    // Store the notification data for later checking
    self.notifications = self.notifications || new Map();
    self.notifications.set(notificationId, {
      habitId,
      title,
      scheduledTime,
      timeoutId: setTimeout(async () => {
        try {
          console.log('Notification time reached for habit:', habitId);
          await self.registration.showNotification(title, {
            body: "Don't forget to complete your habit today!",
            icon: 'icon.png',
            badge: 'badge.png',
            data: { habitId }
          });
          console.log('Notification shown for habit:', habitId);
        } catch (error) {
          console.error('Error in notification timeout:', error);
        } finally {
          self.notifications.delete(notificationId);
        }
      }, scheduledTime.getTime() - now.getTime())
    });
  }
});

self.addEventListener('activate', function(event) {
  console.log('Service worker activated');
  event.waitUntil(
    (async () => {
      if (self.notifications) {
        const now = new Date();
        for (const [id, notification] of self.notifications.entries()) {
          if (notification.scheduledTime < now) {
            clearTimeout(notification.timeoutId);
            self.notifications.delete(id);
          }
        }
      }
    })()
  );
});