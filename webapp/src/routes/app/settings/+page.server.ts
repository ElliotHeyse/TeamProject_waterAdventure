import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    // if (!locals.user) {
    //     throw error(401, 'Unauthorized');
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

    const parentUser = await prisma.user.findUnique({
        where: { id: locals.user.id },
        include: {
            parent: {
                include: {
                    pupils: true
                }
            },
            settings: true,
            notifications: true
        }
    });

    if (!parentUser || !parentUser.parent) {
        throw error(404, 'Parent not found');
    }

    // Trim the parent user object to match the format expected by the header
    const parentUserTrimmed = {
        id: parentUser.id,
        email: parentUser.email,
        name: parentUser.name,
        parent: {
            id: parentUser.parent.id,
            phone: parentUser.parent.phone,
            coachId: parentUser.parent.coachId,
            pupils: parentUser.parent.pupils
        },
        settings: parentUser.settings,
        notifications: parentUser.notifications
    };

    return {
        parentUser: parentUserTrimmed
    };
}) satisfies PageServerLoad;

export const actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        const data = await request.formData();
        const phone = data.get('phone') as string;

        try {
            await prisma.parent.update({
                where: { userId: locals.user.id },
                data: { phone }
            });

            return { type: 'success' };
        } catch (err) {
            console.error('Failed to update profile:', err);
            return fail(400, {
                type: 'error',
                error: 'Failed to update profile'
            });
        }
    }
} satisfies Actions;