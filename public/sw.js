// importScripts("/precache-manifest.7cb96de274005dd5b70689e45d55bd9a.js", "https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js");
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js')

// workbox.setConfig({ debug: false })

workbox.core.setCacheNameDetails({
  prefix: 'releases',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime',
})

// precacheManifest disabled for now
/*
const precacheManifest = self.__precacheManifest || []

const indexRoute = precacheManifest.find(i => i.url === '/index.html')
if (indexRoute) {
  const urls = [
    '/releases',
    '/settings',
  ]
  urls.forEach(url => {
    precacheManifest.push({
      url,
      revision: indexRoute.revision,
    })
  })
}

console.log('manifest', precacheManifest)

// Precache
workbox.precaching.precacheAndRoute(precacheManifest)
// workbox.precaching.precacheAndRoute([])
*/

// Google Fonts: cacheFirst
workbox.routing.registerRoute(
  new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
  workbox.strategies.cacheFirst({
    cacheName: 'releases-googlefonts',
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
    cacheName: 'releases-images',
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
    cacheName: 'releases-jscss',
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
