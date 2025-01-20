import webpush from 'web-push';
import { prisma } from '$lib/server/prisma';

export const load = async ({ url }) => {
    const subscriptions = await prisma.pushSubscription.findMany();
    const errors: string[] = [];

    for (const subscription of subscriptions) {
        try {
            webpush.setVapidDetails(
                `mailto:dries.degreef@gmail.com`,
                "BEZLTJJpHctgQfTkMhIxP-PRf-rzXHBpmj01Mewl4Y3S1_ZNGOlTvJab7vzDPxYQXpu_V-xpsaGXLz7jmbku-SY",
                "rhisdMsIycr0HUg0Csy8VDu7QiP6RWCYBVWjOLqrAtY"
            );

            await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.p256dh,
                        auth: subscription.auth
                    }
                },
                JSON.stringify({
                    title: `Test notification`,
                    body: `Test notification`,
                    url: `${process.env.APP_URL}/app/chat/1`
                })
            );
        } catch (error) {
            // If subscription is invalid, remove it from the database
            console.error(error);
        }
    }

    return {
        success: true,
        errors
    };
};