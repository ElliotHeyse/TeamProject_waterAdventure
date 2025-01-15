import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // Get the coach
    const coach = await prisma.coach.findUnique({
        where: { userId: locals.user.id },
        include: {
            user: true
        }
    });

    if (!coach) {
        throw error(404, 'Coach not found');
    }

    // Get all parents who have pupils assigned to this coach
    const parents = await prisma.parent.findMany({
        where: {
            coachId: coach.id
        },
        include: {
            user: true,
            pupils: true
        }
    });

    return {
        coach,
        parents
    };
};