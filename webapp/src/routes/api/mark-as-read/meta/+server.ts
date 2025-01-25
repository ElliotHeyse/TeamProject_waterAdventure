import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { id: notificationId } = await request.json();
    console.info("API[mark-as-read/notification]: request received");
    console.info("notificationId: ", notificationId);
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

        console.info("API[mark-as-read/notification]: succesfully marked notification as read");
        return json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('API[mark-as-read/notification]: Error marking notification as read:', error);
        return json({ success: false, error: 'Failed to mark notification as read' }, { status: 500 });
    }
};