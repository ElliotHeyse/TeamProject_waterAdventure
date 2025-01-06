import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const load = (async ({ params }: { params: { id: string } }) => {
	const pupilId = params.id;

	const pupil = await prisma.pupil.findUnique({
		where: { id: pupilId },
		select: {
			id: true,
			name: true,
			level: true
		}
	});

	if (!pupil) {
		throw error(404, 'Pupil not found');
	}

	const lessons = await prisma.lesson.findMany({
		orderBy: {
			date: 'desc'
		},
		select: {
			id: true,
			date: true,
			submissions: {
				where: {
					pupilId: pupilId
				}
			}
		}
	});

	return {
		pupil,
		lessons
	};
}) satisfies PageServerLoad;
