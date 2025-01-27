import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
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
}) satisfies PageServerLoad;

export const actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const coach = await prisma.coach.findUnique({
            where: { userId: locals.user.id }
        });

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