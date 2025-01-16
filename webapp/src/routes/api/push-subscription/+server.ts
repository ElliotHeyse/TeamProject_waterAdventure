import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const subscription = await request.json();

    try {
        await prisma.pushSubscription.upsert({
            where: {
                endpoint: subscription.endpoint
            },
            update: {
                auth: subscription.keys.auth,
                p256dh: subscription.keys.p256dh,
                userId: locals.user.id
            },
            create: {
                endpoint: subscription.endpoint,
                auth: subscription.keys.auth,
                p256dh: subscription.keys.p256dh,
                userId: locals.user.id
            }
        });

        return json({ success: true });
    } catch (error) {
        console.error('Error storing push subscription:', error);
        return json({ success: false, error: 'Failed to store subscription' }, { status: 500 });
    }
}; 