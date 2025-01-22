import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const parentUser = await prisma.user.findUnique({
		where: {
			id: locals.user.id
		},
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
		throw redirect(303, '/login');
	}

	return {
		parentUser
	};
}; 