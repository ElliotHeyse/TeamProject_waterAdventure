import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { id: messageId } = await request.json();
    console.info("API[mark-as-read/message]: request received");
    console.info("notificationId: ", messageId);
    try {
        await prisma.message.update({
            where: {
                id: messageId
            },
            data: {
                isRead: true
            }
        });

        console.info("API[mark-as-read/message]: succesfully marked message as read");
        return json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('API[mark-as-read/message]: Error marking message as read:', error);
        return json({ success: false, error: 'Failed to mark message as read' }, { status: 500 });
    }
};