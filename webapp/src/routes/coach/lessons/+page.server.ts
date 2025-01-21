import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}

	const coach = await prisma.coach.findUnique({
		where: { userId: locals.user.id },
		include: {
			parents: true
		}
	});

	if (!coach) {
		throw new Error('Coach not found');
	}

	const parentIds = coach.parents.map(parent => parent.id);

	const levels = await prisma.level.findMany({
		orderBy: { levelNumber: 'asc' },
		include: {
			languageContents: {
				where: {
					language: 'nl'
				}
			},
			levelProgresses: {
				where: {
					pupil: {
						parent: {
							id: {
								in: parentIds
							}
						}
					}
				},
				include: {
					pupil: true
				}
			},
			submissions: {
				where: {
					pupil: {
						parent: {
							id: {
								in: parentIds
							}
						}
					}
				},
				include: {
					pupil: true
				}
			}
		}
	});

	return { levels };
}) satisfies PageServerLoad;

export const actions = {
	createLevel: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const duration = parseInt(formData.get('duration') as string);
		const levelNumber = parseInt(formData.get('levelNumber') as string);

		if (!title || !description || !duration || !levelNumber) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			await prisma.level.create({
				data: {
					duration,
					levelNumber,
					languageContents: {
						create: {
							language: 'nl',
							title
						}
					}
				}
			});
		} catch (error) {
			console.error('Failed to create level:', error);
			return fail(500, { message: 'Failed to create level' });
		}

		return { success: true };
	},
	deleteLevel: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'Missing level ID' });
		}

		try {
			// First, delete all reviews associated with submissions of this level
			await prisma.submission.deleteMany({
				where: {
					level: {
						id: id
					}
				}
			});

			await prisma.video.deleteMany({
				where: {
					exercise: {
						level: { id: id }
					}
				}
			});

			// Delete exercise language content before exercises
			await prisma.exerciseLanguageContent.deleteMany({
				where: {
					exercise: {
						level: { id: id }
					}
				}
			});

			await prisma.exercise.deleteMany({
				where: { level: { id: id } }
			});

			await prisma.submission.deleteMany({
				where: { level: { id: id } }
			});

			await prisma.levelLanguageContent.deleteMany({
				where: { levelId: id }
			});

			await prisma.levelProgress.deleteMany({
				where: { level: { id: id } }
			});

			await prisma.level.delete({
				where: { id }
			});
			return { success: true };
		} catch (error) {
			console.error('Failed to delete level:', error);
			return fail(500, { message: 'Failed to delete level' });
		}
	}
} satisfies Actions;
