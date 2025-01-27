import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	// if (!locals.user) {
	// 	throw new Error('Not authenticated');
	// }
	if (!locals.user) {
		try {
		  // Show unauthorized error
		  throw error(401, 'Unauthorized');
		} catch (e) {
		  // Wait 3 seconds
		  await new Promise(resolve => setTimeout(resolve, 3000));
		  // Redirect to login
		  throw redirect(302, '/login');
		}
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