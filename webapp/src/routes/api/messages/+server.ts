import { prisma } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const parentId = url.searchParams.get('parentId');
    const coachId = url.searchParams.get('coachId');

    if (!parentId || !coachId) {
        throw error(400, 'Missing required parameters');
    }

    const messages = await prisma.message.findMany({
        where: {
            parentId,
            coachId
        },
        orderBy: {
            createdAt: 'asc'
        },
        include: {
            parent: {
                include: {
                    user: true
                }
            },
            coach: {
                include: {
                    user: true
                }
            }
        }
    });

    return new Response(JSON.stringify(messages), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};