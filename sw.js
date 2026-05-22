// 버전을 바꾸면 캐시가 강제 갱신돼요
const CACHE = 'goal-tracker-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 캐시 없이 항상 네트워크에서 가져오기
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request)
    )
  );
});
