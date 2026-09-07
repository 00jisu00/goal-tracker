/* 목표 트래커 — Service Worker
   캐시를 쓰지 않고 항상 네트워크에서 받아옵니다.
   (설치형 앱 자격을 만족시키되, 배포 직후 바로 최신 화면이 뜨도록) */

const VERSION = 'gt-2026-09-07';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));   // 옛 캐시 정리
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req, { cache: 'no-store' }).catch(() =>
      new Response('오프라인 상태예요. 네트워크에 연결한 뒤 다시 열어주세요.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    )
  );
});
