import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
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

    // Get the parent user with all necessary data
    const parentUser = await prisma.user.findUnique({
        where: { id: locals.user.id },
        include: {
            parent: {
                include: {
                    pupils: true,
                    Coach: {
                        include: {
                            user: true
                        }
                    }
                }
            },
            settings: true,
            notifications: true
        }
    });

    if (!parentUser || !parentUser.parent) {
        throw error(404, 'Parent not found');
    }

    if (!parentUser.parent.Coach) {
        throw error(404, 'No coach assigned');
    }

    // Get messages between parent and coach
    const messages = await prisma.message.findMany({
        where: {
            parentId: parentUser.parent.id,
            coachId: parentUser.parent.Coach.id
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

    // Format the parent user data to match the expected structure
    const parentUserTrimmed = {
        id: parentUser.id,
        email: parentUser.email,
        name: parentUser.name,
        parent: {
            id: parentUser.parent.id,
            phone: parentUser.parent.phone,
            coachId: parentUser.parent.Coach.id,
            pupils: parentUser.parent.pupils,
            messages: messages
        },
        settings: parentUser.settings,
        notifications: parentUser.notifications
    };

    return {
        parentUser: parentUserTrimmed,
        coach: parentUser.parent.Coach,
        messages
    };
};

export const actions = {
    sendMessage: async ({ request, locals }) => {
        const data = await request.formData();
        const content = data.get('content')?.toString();

        if (!content) {
            throw error(400, 'Message content is required');
        }

        const parent = await prisma.parent.findUnique({
            where: { userId: locals.user?.id },
            include: {
                Coach: true
            }
        });

        if (!parent) {
            throw error(404, 'Parent not found');
        }

        if (!parent.Coach) {
            throw error(404, 'No coach assigned');
        }

        const message = await prisma.message.create({
            data: {
                content,
                parentId: parent.id,
                coachId: parent.Coach.id,
                sender: 'PARENT'
            }
        });

        return { message };
    }
};