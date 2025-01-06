import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import type { PupilsPageData, NewPupilData } from './types';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	const [pupils, parents] = await Promise.all([
		prisma.pupil.findMany({
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
			},
			orderBy: {
				name: 'asc'
			}
		}),
		prisma.parent.findMany({
			include: {
				user: {
					select: {
						name: true,
						email: true
					}
				}
			},
			orderBy: {
				user: {
					name: 'asc'
				}
			}
		})
	]);

	const data: PupilsPageData = {
		pupils,
		parents
	};

	return data;
}) satisfies PageServerLoad;

export const actions = {
	createPupil: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const dateOfBirth = formData.get('dateOfBirth') as string;
		const level = formData.get('level') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
		const parentId = formData.get('parentId') as string;
		const notes = formData.get('notes') as string;

		if (!name || !dateOfBirth || !level || !parentId) {
			return fail(400, { message: 'Missing required fields' });
		}

		// Get the coach ID (you'll need to implement proper auth later)
		const coach = await prisma.coach.findFirst();
		if (!coach) {
			return fail(500, { message: 'No coach found' });
		}

		try {
			await prisma.pupil.create({
				data: {
					name,
					dateOfBirth: new Date(dateOfBirth),
					level,
					parentId,
					coachId: coach.id,
					notes: notes || null
				}
			});
		} catch (error) {
			console.error('Failed to create pupil:', error);
			return fail(500, { message: 'Failed to create pupil' });
		}

		return { success: true };
	}
} satisfies Actions;
