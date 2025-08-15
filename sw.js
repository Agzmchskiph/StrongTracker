const CACHE_NAME = 'pd-tracker-v2'
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  // иконки (если есть в проекте)
  './icons/icon-192.png',
  './icons/icon-512.png',
]

// install: кладём офлайн-ассеты
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)))
  self.skipWaiting()
})

// activate: чистим старые версии
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))))
  self.clients.claim()
})

// fetch: сеть с подменой кэшем при офлайне
self.addEventListener('fetch', e => {
  const req = e.request

  // Кэшируем только запросы к нашему origin
  const url = new URL(req.url)
  if (url.origin !== location.origin) return // пропускаем сторонние

  e.respondWith(
    fetch(req)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone))
        return res
      })
      .catch(() => caches.match(req)),
  )
})
