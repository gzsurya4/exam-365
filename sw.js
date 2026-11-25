// Service worker minimal agar aplikasi dapat dipasang. Tidak menyimpan cache data ujian (selalu ambil langsung dari jaringan).
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { /* langsung ke jaringan */ });
