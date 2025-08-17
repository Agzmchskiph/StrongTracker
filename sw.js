const CACHE_NAME = 'tb-tracker-v1'
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/192.png', './icons/512.png'
]

self.addEventListener('install', e => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(ASSETS)
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
      self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request)
      if (cached) return cached
      try {
        return await fetch(e.request)
      } catch {
        if (e.request.mode === 'navigate') return caches.match('./index.html')
        return new Response('Offline', { status: 503 })
      }
    })(),
  )
})

