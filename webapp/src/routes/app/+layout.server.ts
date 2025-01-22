import { prisma } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const parent = await prisma.parent.findUnique({
		where: { userId: locals.user.id },
		include: {
			user: {
				select: {
					name: true,
					email: true
				}
			},
			pupils: true
		}
	});

	if (!parent) {
		throw error(404, 'Parent not found');
	}

	return {
		parent
	};
}) satisfies LayoutServerLoad; 