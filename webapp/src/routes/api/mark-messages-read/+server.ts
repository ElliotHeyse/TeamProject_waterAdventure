import { prisma } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { messageIds } = await request.json();

    if (!messageIds || !Array.isArray(messageIds)) {
        throw error(400, 'Invalid request body');
    }

    await prisma.message.updateMany({
        where: {
            id: {
                in: messageIds
            }
        },
        data: {
            isRead: true
        }
    });

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}; 