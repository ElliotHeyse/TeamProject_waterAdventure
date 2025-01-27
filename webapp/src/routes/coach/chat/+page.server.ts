import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const coach = await prisma.coach.findUnique({
        where: { userId: locals.user.id },
        include: {
            parents: {
                include: {
                    user: true,
                    pupils: true,
                    messages: {
                        where: {
                            sender: 'PARENT',
                            isRead: false
                        }
                    }
                }
            }
        }
    });

    if (!coach) {
        throw error(404, 'Coach not found');
    }

    return {
        coach,
        parents: coach.parents.map(parent => ({
            ...parent,
            unreadCount: parent.messages.length
        }))
    };
}) satisfies PageServerLoad;