import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
    // Get the parent
    const parent = await prisma.parent.findUnique({
        where: { userId: locals.user?.id },
        include: {
            user: true
        }
    });

    if (!parent) {
        throw error(404, 'Parent not found');
    }

    // Get the coach assigned to the parent's pupils
    const pupil = await prisma.pupil.findFirst({
        where: { parentId: parent.id },
        include: {
            coach: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!pupil?.coach) {
        throw error(404, 'No coach assigned');
    }

    // Get messages between parent and coach
    const messages = await prisma.message.findMany({
        where: {
            parentId: parent.id,
            coachId: pupil.coach.id
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

    return {
        parent,
        coach: pupil.coach,
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
                pupils: {
                    include: {
                        coach: true
                    }
                }
            }
        });

        if (!parent) {
            throw error(404, 'Parent not found');
        }

        const coach = parent.pupils[0]?.coach;
        if (!coach) {
            throw error(404, 'No coach assigned');
        }

        const message = await prisma.message.create({
            data: {
                content,
                parentId: parent.id,
                coachId: coach.id
            }
        });

        return { message };
    }
}; 