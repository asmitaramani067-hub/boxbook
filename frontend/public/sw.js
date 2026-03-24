// Skip waiting so new SW activates immediately on deploy
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'PitchUp', {
      body: data.body || 'You have a new notification',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: data.data || {},
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // owners go to dashboard, players go to turfs listing
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
