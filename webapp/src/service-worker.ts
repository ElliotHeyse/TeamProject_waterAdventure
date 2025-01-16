/// <reference lib="webworker" />
const worker = self as unknown as ServiceWorkerGlobalScope;

self.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {};
	const title = data.title || 'New Notification';
	const options = {
		body: data.body || 'You have a new notification',
		icon: '/favicon.svg',
		badge: '/favicon.svg',
		data: {
			url: data.url
		}
	};

	event.waitUntil(worker.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(worker.clients.openWindow(event.notification.data.url));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		worker.registration.navigationPreload.enable().then(() => {
			console.log('Service Worker activated');
			return worker.clients.claim();
		})
	);
});

self.addEventListener('install', (event) => {
	event.waitUntil(worker.skipWaiting());
});
