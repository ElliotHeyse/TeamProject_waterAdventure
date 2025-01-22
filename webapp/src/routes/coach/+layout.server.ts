import { prisma } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const coach = await prisma.coach.findUnique({
        where: { userId: locals.user.id },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!coach) {
        throw error(404, 'Coach not found');
    }

    return {
        coach
    };
}) satisfies LayoutServerLoad; 