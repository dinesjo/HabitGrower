importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js");

import { precacheAndRoute } from 'workbox-precaching'
precacheAndRoute(self.__WB_MANIFEST)

firebase.initializeApp({
  apiKey: "AIzaSyDMfCeJUzcBqHpfdfDbi_KQ4KIzmQuwOMs",
  authDomain: "habitgrower.firebaseapp.com",
  databaseURL: "https://habitgrower-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "habitgrower",
  storageBucket: "habitgrower.appspot.com",
  messagingSenderId: "691357820339",
  appId: "1:691357820339:web:7d043f04ec49fbb04417c6",
  measurementId: "G-JWYJH25B7E",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Prevent Firebase from showing its own notification (resulting in duplicate)
  self.registration.getNotifications().then((notifications) => {
    notifications.forEach((notification) => {
      notification.close();
    });
  });

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/pwa-512x512.png",
  });
});
