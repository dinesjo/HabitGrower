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
  const habitId = event.notification.data.habitId;
  event.waitUntil(
    self.clients.openWindow(`https://habitgrower.web.app/habits/${habitId}`)
  );
});

self.addEventListener('schedule-notification', function(event) {
  const { habitId, title, time } = event.data;
  
  const scheduledTime = new Date(time).getTime();
  const now = new Date().getTime();
  const delay = scheduledTime - now;

  if (delay > 0) {
    setTimeout(async () => {
      // Check if habit is already completed for today
      const response = await fetch(`/api/habits/${habitId}/status`);
      const { completed } = await response.json();
      
      if (!completed) {
        self.registration.showNotification(title, {
          body: "Don't forget to complete your habit today!",
          icon: 'icon.png',
          badge: 'badge.png',
          data: { habitId }
        });
      }
    }, delay);
  }
});