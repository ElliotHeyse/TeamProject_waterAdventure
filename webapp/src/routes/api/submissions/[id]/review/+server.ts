import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
	const { feedback, medal } = await request.json();

	if (!feedback) {
		throw error(400, 'Missing feedback');
	}

	// Get the submission with lesson and pupil details
	const submission = await prisma.submission.findUnique({
		where: { id: params.id },
		include: {
			lesson: true,
			pupil: true
		}
	});

	if (!submission) {
		throw error(404, 'Submission not found');
	}

	// Update submission and level progress
	const updatedSubmission = await prisma.$transaction(async (tx) => {
		// Update submission status
		const updated = await tx.submission.update({
			where: { id: params.id },
			data: {
				status: 'REVIEWED',
				feedback,
				medal
			}
		});

		// If a medal is assigned, mark all parts of the lesson as completed with the medal
		if (medal !== 'NONE') {
			await tx.levelProgress.updateMany({
				where: {
					pupilId: submission.pupilId,
					lessonId: submission.lessonId
				},
				data: {
					completed: true,
					completedAt: new Date(),
					medal
				}
			});
		}

		return updated;
	});

	return json(updatedSubmission);
};
