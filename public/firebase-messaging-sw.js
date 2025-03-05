self.importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js");
self.importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js");

self.firebase.initializeApp({
  apiKey: "AIzaSyDMfCeJUzcBqHpfdfDbi_KQ4KIzmQuwOMs",
  authDomain: "habitgrower.firebaseapp.com",
  databaseURL: "https://habitgrower-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "habitgrower",
  storageBucket: "habitgrower.appspot.com",
  messagingSenderId: "691357820339",
  appId: "1:691357820339:web:7d043f04ec49fbb04417c6",
  measurementId: "G-JWYJH25B7E",
});

const messaging = self.firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.data.title;
  let frequenctUnitFriendly;
  switch (payload.data.frequencyUnit) {
    case 'day':
      frequenctUnitFriendly = 'today';
      break;
    case 'week':
      frequenctUnitFriendly = 'this week';
      break;
    case 'month':
      frequenctUnitFriendly = 'this month';
      break;
    default:
      frequenctUnitFriendly = '';
  }
  const notificationOptions = {
    body: `${payload.data.progressPercent}% complete${payload.data.frequencyUnit ? ` ${frequenctUnitFriendly}` : ''}`,
    icon: '/pwa-512x512.png',
    badge: '/pwa-192x192.png',
    data: {
      habitId: payload.data.habitId,
      userId: payload.data.userId,
    },
    actions: [
      {
        action: 'registerHabitNow',
        title: 'Register now',
      }
    ],
    tag: payload.data.habitId,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
      })
      .then(async (clientList) => {
        if (event.action === 'registerHabitNow') {
          self.registration.showNotification('Registering habit...', {
            icon: '/pwa-512x512.png',
            badge: '/pwa-192x192.png',
            tag: event.notification.data.habitId,
          });

          await fetch(`https://habit-grower.vercel.app/api/registerHabitNow?userId=${event.notification.data.userId}&habitId=${event.notification.data.habitId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((response) => {
            if (response.ok) {
              return self.registration.showNotification('Habit registered successfully', {
                icon: '/pwa-512x512.png',
                badge: '/pwa-192x192.png',
                tag: event.notification.data.habitId,
              });
            } else {
              console.error('Habit registration failed');
              return self.registration.showNotification('Habit registered FAILED!', {
                body: 'Could not register the habit, open the app to do so',
                icon: '/pwa-512x512.png',
                badge: '/pwa-192x192.png',
                tag: event.notification.data.habitId,
              });
            }
          }).catch((error) => {
            console.error('Habit registration failed', error);
            return self.registration.showNotification('Habit registered FAILED!', {
              body: 'Could not register the habit, open the app to do so',
              icon: '/pwa-512x512.png',
              badge: '/pwa-192x192.png',
              tag: event.notification.data.habitId,
            });
          });

          return;
        }

        event.notification.close();

        for (const client of clientList) {
          // Check if the client URL is the root URL and if it can be focused
          if (client.url === "/" && "focus" in client) {
            return client.focus(); // Focus the client and stop further execution
          }
        }

        // If no matching client is found, open a new window with the root URL
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      }),
  );
});