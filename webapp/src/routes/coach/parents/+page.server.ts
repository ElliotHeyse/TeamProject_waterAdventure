import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const parents = await prisma.parent.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            },
            pupils: true
        },
        orderBy: {
            user: {
                name: 'asc'
            }
        }
    });

    return {
        parents
    };
}) satisfies PageServerLoad;