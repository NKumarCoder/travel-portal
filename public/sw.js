/**
 * Service Worker — Travel Platform
 *
 * Rules:
 * - Only cache GET requests over http/https
 * - Never cache POST, PUT, PATCH, DELETE
 * - Never cache chrome-extension:// or other non-http schemes
 * - Never cache API/auth/booking/payment requests
 * - In development, bypass caching entirely
 */

const CACHE_NAME = "travel-platform-v1";

// Patterns that should NEVER be cached
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /\/auth/,
  /\/login/,
  /\/booking/,
  /\/payment/,
  /\/search/,
];

// Only cache these content types
const CACHEABLE_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".ico",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-http(s) schemes (chrome-extension://, etc.)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // 2. Skip non-GET methods — never cache POST, PUT, PATCH, DELETE
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // 3. Skip API and dynamic requests
  if (NO_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(fetch(request));
    return;
  }

  // 4. In development, don't cache anything
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    event.respondWith(fetch(request));
    return;
  }

  // 5. Only cache static assets
  const isCacheable = CACHEABLE_EXTENSIONS.some((ext) =>
    url.pathname.endsWith(ext)
  );

  if (!isCacheable) {
    event.respondWith(fetch(request));
    return;
  }

  // 6. Cache-first strategy for safe static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      });
    })
  );
});
