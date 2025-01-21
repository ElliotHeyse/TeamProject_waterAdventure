import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PrismaClient, SubmissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const load = (async ({ params }: { params: { id: string } }) => {
	const pupilId = params.id;

	const pupil = await prisma.pupil.findUnique({
		where: { id: pupilId },
		select: {
			id: true,
			name: true,
			notes: true,
			createdAt: true,
			parent: {
				select: {
					id: true,
					phone: true,
					user: {
						select: {
							name: true,
							email: true
						}
					}
				}
			},
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

	const totalLessons = await prisma.level.count();

	const completedLessons = await prisma.submission.count({
		where: {
			pupilId: pupilId,
			status: SubmissionStatus.REVIEWED
		}
	});

	const lessons = await prisma.level.findMany({
		where: {
			submissions: {
				some: {
					pupilId: pupilId
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		},
		select: {
			id: true,
			createdAt: true,
			languageContents: {
				where: {
					language: 'nl'
				},
				select: {
					title: true
				}
			}
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
			level: {
				select: {
					languageContents: {
						where: {
							language: 'nl'
						},
						select: {
							title: true
						}
					}
				}
			},
			feedback: true,
			medal: true
		}
	});

	return {
		pupil,
		lessons,
		submissions,
		totalLessons,
		completedLessons
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

		try {
			await prisma.pupil.update({
				where: { id },
				data: {
					name,
					notes
				}
			});

			return { success: true };
		} catch (e) {
			throw error(500, 'Failed to update pupil');
		}
	}
} satisfies Actions;
