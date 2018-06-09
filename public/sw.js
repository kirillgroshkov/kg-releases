importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js')

// workbox.setConfig({ debug: false })

workbox.core.setCacheNameDetails({
  prefix: 'releases',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime',
})

// Google Fonts: cacheFirst
workbox.routing.registerRoute(
  new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
  workbox.strategies.cacheFirst({
    cacheName: 'googlefonts',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 30,
      }),
    ],
  }),
)

// Images: cacheFirst
workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
)

// JS, CSS: cacheFirst
workbox.routing.registerRoute(
  new RegExp('^/(?:js|css)/.*'),
  workbox.strategies.cacheFirst({
    cacheName: 'jscss',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
)

// GA
workbox.googleAnalytics.initialize()
