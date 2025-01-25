import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { id: submissionId } = await request.json();
    console.info("API[mark-as-read/submission]: request received");
    try {
        await prisma.submission.update({
            where: {
                id: submissionId
            },
            data: {
                isRead: true
            }
        });

        console.info("API[mark-as-read/submission]: succesfully marked submission as read");
        return json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('API[mark-as-read/submission]: Error marking submission as read:', error);
        return json({ success: false, error: 'Failed to mark submission as read' }, { status: 500 });
    }
};