// Legacy service worker (Workbox, 2018). Unregisters itself and clears its caches on old clients.
self.addEventListener('install', () => globalThis.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      await globalThis.registration.unregister()
      for (const key of await caches.keys()) await caches.delete(key)
      for (const client of await globalThis.clients.matchAll({ type: 'window' })) {
        client.navigate(client.url)
      }
    })(),
  )
})
