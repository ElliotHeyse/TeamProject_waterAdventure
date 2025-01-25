import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { notificationId } = await request.json();
    console.info("API[level-progress]: request received");
    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: locals.user.id // Ensure the notification belongs to the user
            },
            data: {
                isRead: true
            }
        });

        return json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return json({ success: false, error: 'Failed to mark notification as read' }, { status: 500 });
    }
}; 