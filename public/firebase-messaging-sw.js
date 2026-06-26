importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDcCgQY-MYUoJDExzI6kz9lfar4bTOhJ1M",
  authDomain: "tanganyika-challenge-hub.firebaseapp.com",
  projectId: "tanganyika-challenge-hub",
  storageBucket: "tanganyika-challenge-hub.firebasestorage.app",
  messagingSenderId: "656784965853",
  appId: "1:656784965853:web:0af203ab222e196b1b5b34",
});

const messaging = firebase.messaging();

// Show notification when app is in background
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Challenge Hub', {
    body: body || 'You have a new message!',
    icon: icon || '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    tag: 'challenge-hub',
    renotify: true,
    data: payload.data || {},
  });
});

// Click on notification opens the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/dashboard');
    })
  );
});
