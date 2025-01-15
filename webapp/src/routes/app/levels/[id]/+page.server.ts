import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const levelNumber = parseInt(params.id);
	if (isNaN(levelNumber)) {
		throw error(400, 'Invalid level number');
	}

	const lesson = await prisma.lesson.findFirst({
		where: {
			isSwimmingLesson: true,
			order: levelNumber
		},
		include: {
			exercises: {
				include: {
					videos: true
				}
			}
		}
	});

	if (!lesson) {
		throw error(404, 'Swimming lesson not found');
	}

	return {
		lesson
	};
};