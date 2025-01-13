import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	const [lessons, pupil] = await Promise.all([
		prisma.lesson.findMany({
			orderBy: [{ date: 'asc' }]
		}),
		prisma.pupil.findFirst()
	]);

	if (!pupil) {
		throw new Error('No pupil found');
	}

	return { lessons, pupil };
}) satisfies PageServerLoad;

export const actions = {
	createSubmission: async ({ request }) => {
		const formData = await request.formData();
		const lessonId = formData.get('lessonId') as string;
		const pupilId = formData.get('pupilId') as string;
		const videoUrl = formData.get('videoUrl') as string;

		if (!lessonId || !pupilId || !videoUrl) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			await prisma.submission.create({
				data: {
					lessonId,
					pupilId,
					videoUrl,
					status: 'PENDING'
				}
			});
		} catch (error) {
			console.error('Failed to create submission:', error);
			return fail(500, { message: 'Failed to create submission' });
		}

		return { success: true };
	}
} satisfies Actions;
