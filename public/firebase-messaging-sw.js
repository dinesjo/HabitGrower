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
  // Customize notification here
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
    body: `${payload.data.progressPercent}% done${payload.data.frequencyUnit ? ` ${frequenctUnitFriendly}` : ''}`,
    icon: '/pwa-512x512.png',
    badge: '/pwa-192x192.png',
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow("/");
      }),
  );
});