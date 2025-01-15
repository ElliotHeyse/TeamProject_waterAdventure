import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

let parent: Awaited<ReturnType<typeof findParent>>;

export const load = (async ({ cookies }) => {
    // Get session token from cookie
    const sessionToken = cookies.get('session');
    
    if (!sessionToken) {
        console.error('No session token found');
        throw error(401, 'No session token found');
    } else {
        console.log('Session token found');
    }
    
    parent = await findParent(sessionToken);

    return {
        parent
    };
}) satisfies PageServerLoad;

export const actions = {
    updateProfile: async ({ request }) => {
        const data = await request.formData();
        const phone = data.get('phone') as string;
        console.log(`updateProfile: phone=${phone}`);
        
        try {
            // Update only the phone number for the parent
            await prisma.parent.update({
                where: { id: parent.id },
                data: { phone }
            });

            console.log('Parent profile updated successfully'); // dev
            return { success: true };
        } catch (error) {
            console.error('Failed to update profile:', error);
            return fail(400, { 
                message: 'Failed to update profile',
                phone 
            });
        }
    }
} satisfies Actions;

const findParent = async (sessionToken: string) => {
    const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: {
            user: {
                include: {
                    parent: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!session || !session.user.parent) {
        throw error(401, 'No valid session found in database');
    } else {
        console.log('Valid session found in database'); // dev
    }

    return session.user.parent;
}