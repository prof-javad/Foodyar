const CACHE_NAME = 'foodyar-v1';
const ASSETS_TO_CACHE = [
  '/Foodyar/',
  '/Foodyar/index.html',
  '/Foodyar/style.css',
  '/Foodyar/script.js',
  '/Foodyar/firebase.js',
  '/Foodyar/manifest.json',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap',
  'https://fonts.gstatic.com/s/vazirmatn/v11/D2M8YpZ8n8kGXKqjQr8HnA.woff2'
];

// نصب سرویس ورکر و کش کردن فایل‌ها
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// فعال کردن و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتژی: Cache First, سپس Network
self.addEventListener('fetch', (event) => {
  // فقط درخواست‌های GET را هندل کن
  if (event.request.method !== 'GET') return;
  
  // درخواست‌های Firebase را از کش نگیر (همیشه آنلاین باشن)
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }
  
  // اصلاح URL برای تطابق با مسیر پایه
  let requestUrl = event.request.url;
  if (requestUrl.includes('/Foodyar/') && !requestUrl.includes('.')) {
    requestUrl = '/Foodyar/';
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        // فقط پاسخ‌های موفق را کش کن
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // اگر آفلاین بود و صفحه اصلی بود، صفحه آفلاین برگردون
        if (event.request.url.includes('/Foodyar/') && !event.request.url.includes('.')) {
          return caches.match('/Foodyar/index.html');
        }
        return new Response('شما آفلاین هستید!', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/html; charset=utf-8',
          })
        });
      });
    })
  );
});

// همگام‌سازی پس‌زمینه برای عملیات آفلاین
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-foods') {
    event.waitUntil(syncFoods());
  }
});

async function syncFoods() {
  console.log('Syncing foods...');
}

// پوش نوتیفیکیشن (اختیاری)
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
