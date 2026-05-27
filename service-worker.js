const CACHE_NAME = 'foodyar-v2';
const STATIC_ASSETS = [
  '/Foodyar/',
  '/Foodyar/index.html',
  '/Foodyar/style.css',
  '/Foodyar/script.js',
  '/Foodyar/firebase.js',
  '/Foodyar/manifest.json'
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap'
];

// نصب سرویس ورکر
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open('fonts-cache').then((cache) => cache.addAll(EXTERNAL_ASSETS))
    ])
  );
  self.skipWaiting();
});

// فعال کردن و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== 'fonts-cache') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتژی: Network First برای HTML، Cache First برای بقیه
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // درخواست‌های Firebase را نادیده بگیر
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic')) {
    return;
  }
  
  // برای صفحات HTML -先用 Network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // برای بقیه assets - Cache First
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => new Response('آفلاین', { status: 503 }))
  );
});

// همگام‌سازی پس‌زمینه
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-foods') {
    event.waitUntil(syncFoods());
  }
});

async function syncFoods() {
  console.log('Syncing foods...');
}

// پوش نوتیفیکیشن
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'یادآوری غذا!',
    icon: 'https://emojicdn.elk.sh/🍔?style=apple&size=96',
    badge: 'https://emojicdn.elk.sh/🍔?style=apple&size=72',
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'باز کردن' },
      { action: 'close', title: 'بستن' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('فودیار', options)
  );
});
