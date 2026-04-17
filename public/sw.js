// Service Worker pour la gestion du cache et des notifications Push
const CACHE_NAME = 'bayo-basics-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Bayo Basics', body: 'Nouvelle mise à jour !' };
  
  const options = {
    body: data.body,
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});