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
						// First check if we already have a subscription
						let subscription = await registration.pushManager.getSubscription();

						// If we have an existing subscription, try to use it
						if (subscription) {
							try {
								const response = await fetch('/api/push-subscription', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify(subscription)
								});

								// If we get a 410 Gone status, the subscription is expired
								if (response.status === 410) {
									// Unsubscribe from the old subscription
									await subscription.unsubscribe();
									subscription = null;
								} else if (!response.ok) {
									console.error('Failed to store push subscription');
									return;
								}
							} catch (error) {
								console.error('Error storing push subscription:', error);
								return;
							}
						}

						// If we don't have a subscription or it was expired, create a new one
						if (!subscription) {
							try {
								subscription = await registration.pushManager.subscribe({
									userVisibleOnly: true,
									applicationServerKey: publicKey
								});

								const response = await fetch('/api/push-subscription', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify(subscription)
								});

								if (!response.ok) {
									console.error('Failed to store new push subscription');
								}
							} catch (error) {
								console.error('Error creating new push subscription:', error);
							}
						}
					});
				}
			}
		}
	}

}) satisfies LayoutLoad;

// export let ssr = false;
// export let prerender = false;