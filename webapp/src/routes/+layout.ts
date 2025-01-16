import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load = (async ({ url }) => {
    if (browser) {
		if ('Notification' in window && url.pathname != '/login') {
			if (Notification.permission !== 'granted') {
				Notification.requestPermission();
			} else {
				let publicKey = 'BEZLTJJpHctgQfTkMhIxP-PRf-rzXHBpmj01Mewl4Y3S1_ZNGOlTvJab7vzDPxYQXpu_V-xpsaGXLz7jmbku-SY';

				if ('serviceWorker' in navigator) {
					navigator.serviceWorker.ready.then(async (registration) => {
						const subscription = await registration.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey: publicKey
						});

						try {
							const response = await fetch('/api/push-subscription', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(subscription)
							});

							if (!response.ok) {
								console.error('Failed to store push subscription');
							}
						} catch (error) {
							console.error('Error storing push subscription:', error);
						}
					});
				}
			}
		}
	}

}) satisfies LayoutLoad;