const APP_CACHE = 'txd-app-v4'
const MODEL_CACHE = 'txd-models-v4'
const APP_SHELL = ['/', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png']

const MODEL_EXTENSIONS = ['.glb', '.gltf', '.hdr', '.ktx2', '.webp', '.jpg', '.jpeg', '.png']

function isModelAsset(url) {
  const pathname = url.pathname.toLowerCase()
  if (pathname.startsWith('/api/')) return false
  return MODEL_EXTENSIONS.some(ext => pathname.endsWith(ext))
}

function isBuildAsset(url, request) {
  const pathname = url.pathname.toLowerCase()
  return pathname.startsWith('/_next/') || request.destination === 'script' || request.destination === 'style'
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => ![APP_CACHE, MODEL_CACHE].includes(key))
          .map(key => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (isBuildAsset(url, request)) {
    // Avoid stale JS/CSS bundles across deploys.
    event.respondWith(fetch(request))
    return
  }

  if (isModelAsset(url)) {
    event.respondWith(
      caches.open(MODEL_CACHE).then(async cache => {
        const cached = await cache.match(request)
        if (cached) return cached

        const network = await fetch(request)
        if (network && network.ok) {
          cache.put(request, network.clone())
        }
        return network
      })
    )
    return
  }

  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    caches.match(request).then(async cached => {
      if (cached) return cached
      const network = await fetch(request)
      if (network && network.ok && request.destination !== 'document') {
        const cache = await caches.open(APP_CACHE)
        cache.put(request, network.clone())
      }
      return network
    })
  )
})
