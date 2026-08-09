const CACHE_NAME = 'garageone-v613';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy with Cache Invalidation for Instant Updates
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(e.request))
  );
});

// Handler de interacción al presionar una notificación programada
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// Función para programar notificaciones nativas del SO en segundo plano
function scheduleSWNotification(reminder) {
  if (!reminder || !reminder.title) return;
  const notifTitle = `GarageOne - ${reminder.title}`;
  const notifBody = `${reminder.vehicleName || 'Vehículo'}: Fecha: ${reminder.targetDate}${reminder.time ? ' ' + reminder.time : ''} (${reminder.category || 'Recordatorio'})`;
  const options = {
    body: notifBody,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: `rem_${reminder.id}`
  };

  if (reminder.targetTimestamp) {
    const delayMs = reminder.targetTimestamp - Date.now();

    // Intentar programar la alarma nativa del SO usando TimestampTrigger si la soporta el dispositivo
    if ('showTrigger' in Notification.prototype && typeof TimestampTrigger !== 'undefined') {
      try {
        options.showTrigger = new TimestampTrigger(reminder.targetTimestamp);
        self.registration.showNotification(notifTitle, options);
        return;
      } catch (e) {
        console.error('Error al configurar TimestampTrigger:', e);
      }
    }

    // Programador en segundo plano del Service Worker para garantizar entrega
    if (delayMs > 0 && delayMs <= 86400000 * 30) {
      setTimeout(() => {
        self.registration.showNotification(notifTitle, options);
      }, delayMs);
    } else if (delayMs <= 0) {
      self.registration.showNotification(notifTitle, options);
    }
  }
}

// Receptor de mensajes enviados desde app.js para sincronizar alarmas en segundo plano
self.addEventListener('message', (e) => {
  if (!e.data) return;
  if (e.data.type === 'SCHEDULE_REMINDER') {
    scheduleSWNotification(e.data.reminder);
  } else if (e.data.type === 'SYNC_REMINDERS' && Array.isArray(e.data.reminders)) {
    e.data.reminders.forEach(r => scheduleSWNotification(r));
  }
});
