import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PrismaClient, Level } from '@prisma/client';

const prisma = new PrismaClient();

export const load = (async ({ params }: { params: { id: string } }) => {
	const pupilId = params.id;

	const pupil = await prisma.pupil.findUnique({
		where: { id: pupilId },
		select: {
			id: true,
			name: true,
			level: true,
			notes: true,
			createdAt: true,
			_count: {
				select: {
					submissions: true
				}
			}
		}
	});

	if (!pupil) {
		throw error(404, 'Pupil not found');
	}

	const lessons = await prisma.lesson.findMany({
		where: {
			submissions: {
				some: {
					pupilId: pupilId
				}
			}
		},
		orderBy: {
			date: 'desc'
		},
		select: {
			id: true,
			date: true,
			title: true,
			description: true
		}
	});

	const submissions = await prisma.submission.findMany({
		where: {
			pupilId: pupilId
		},
		orderBy: {
			createdAt: 'desc'
		},
		select: {
			id: true,
			createdAt: true,
			status: true,
			lesson: {
				select: {
					title: true
				}
			},
			review: {
				select: {
					comment: true,
					createdAt: true
				}
			}
		}
	});

	return {
		pupil,
		lessons,
		submissions
	};
}) satisfies PageServerLoad;

export const actions = {
	updatePupil: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = data.get('name') as string;
		const levelStr = data.get('level') as string;
		const notes = data.get('notes') as string;

		if (!id || !name || !levelStr) {
			throw error(400, 'Missing required fields');
		}

		// Convert level string to enum
		const level = levelStr.toUpperCase() as Level;
		if (!Object.values(Level).includes(level)) {
			throw error(400, 'Invalid level');
		}

		try {
			await prisma.pupil.update({
				where: { id },
				data: {
					name,
					level,
					notes
				}
			});

			return { success: true };
		} catch (e) {
			throw error(500, 'Failed to update pupil');
		}
	}
} satisfies Actions;
