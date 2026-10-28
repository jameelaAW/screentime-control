// Screen Time Control service worker: receives phone alerts and opens the app when one is tapped.
// It caches nothing, so the app always shows live data.
// Kept deliberately plain: iPhone is strict about notification options, and every push must show something.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    try { data = { body: event.data.text() }; } catch (e2) { data = {}; }
  }
  const title = typeof data.title === 'string' && data.title ? data.title : 'Screen Time Control';
  const options = { body: typeof data.body === 'string' ? data.body : '', icon: '/pwa-icon/192' };
  if (typeof data.tag === 'string' && data.tag) options.tag = data.tag;
  event.waitUntil(
    self.registration.showNotification(title, options).catch(() => self.registration.showNotification('Screen Time Control'))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if ('focus' in client) {
        await client.focus();
        return;
      }
    }
    await self.clients.openWindow('/');
  })());
});
