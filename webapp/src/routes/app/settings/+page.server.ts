import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
    // TODO: Replace with actual auth 
    const parent = await prisma.parent.findFirst({
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!parent) {
        throw new Error('No parent found');
    }

    return {
        parent
    };
}) satisfies PageServerLoad;

export const actions = {
    updateProfile: async ({ request }) => {
        // TODO: Replace with actual auth
        const parent = await prisma.parent.findFirst();
        if (!parent) {
            return fail(404, { message: 'Parent not found' });
        }

        const data = await request.formData();
        // Add parent profile update logic here

        return { success: true };
    }
} satisfies Actions;