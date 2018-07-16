/* eslint no-restricted-globals: 0 */

const GET = 'GET';
const CACHE_NAME = 'pwa-workshop';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', () => self.clients.claim());

// const cacheFirst = async event => {
//     const { request } = event;
//     const cache = await caches.open(CACHE_NAME);
//     const cachedResponse = await cache.match(request.url);
//
//     if (cachedResponse) {
//         return cachedResponse;
//     }
//
//     try {
//         const response = await fetch(request.clone());
//         await cache.put(event.request.url, response.clone());
//         return response;
//     } catch (error) {
//         return error;
//     }
// };

const fetchFirst = async event => {
    const { request } = event;
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request.url);

    try {
        const response = await fetch(request.clone());
        await cache.put(event.request.url, response.clone());
        return response;
    } catch (error) {
        return cachedResponse;
    }
};

self.addEventListener('fetch', event => {
    if (event.request.method === GET) {
        // event.respondWith(cacheFirst(event));
        event.respondWith(fetchFirst(event));
    }
});

self.addEventListener('push', event => {
    const notification = event.data.json();
    event.waitUntil(self.registration.showNotification(notification.title, notification));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    // This looks to see if there is already an open window and
    // focuses if it is
    event.waitUntil(
        clients.matchAll().then(clientList => {
            for (let i = 0; i < clientList.length; i += 1) {
                const client = clientList[i];
                return client.navigate('/');
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});

const internetConnectivityCheck = () =>
    new Promise(async (resolve, reject) => {
        if (navigator.onLine) {
            await self.registration.showNotification('PWA Workshop is Online!!');
            return resolve();
        }
        return reject();
    });

self.addEventListener('sync', event => {
    if (event.tag === 'check-connectivity') {
        event.waitUntil(internetConnectivityCheck());
    }
});