import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
    // TODO: Replace with actual auth
    const coach = await prisma.coach.findFirst({
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
        throw new Error('No coach found');
    }

    return {
        coach
    };
}) satisfies PageServerLoad;

export const actions = {
    updateProfile: async ({ request }) => {
        // TODO: Replace with actual auth
        const coach = await prisma.coach.findFirst();
        if (!coach) {
            return fail(404, { message: 'Coach not found' });
        }

        const data = await request.formData();
        const bio = data.get('bio') as string;
        const specialtiesStr = data.get('specialties') as string;
        const specialties = specialtiesStr.split(',').map(s => s.trim()).filter(Boolean);

        try {
            await prisma.coach.update({
                where: { id: coach.id },
                data: {
                    bio,
                    specialties
                }
            });

            return { success: true };
        } catch (error) {
            console.error('Failed to update profile:', error);
            return fail(500, { message: 'Failed to update profile' });
        }
    }
} satisfies Actions; 