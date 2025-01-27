import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
	const { feedback, medal } = await request.json();

	if (!feedback) {
		throw error(400, 'Missing feedback');
	}

	// Get the submission with level and pupil details
	const submission = await prisma.submission.findUnique({
		where: { id: params.id },
		include: {
			level: true,
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
				medal,
				feedbackTimestamp: new Date()
			}
		});

		// If a medal is assigned, update the level progress
		// if (medal !== 'NONE') {
		// 	await tx.levelProgress.upsert({
		// 		where: {
		// 			pupilId_levelNumber: {
		// 				pupilId: submission.pupilId,
		// 				levelNumber: submission.levelNumber
		// 			}
		// 		},
		// 		create: {
		// 			pupilId: submission.pupilId,
		// 			levelNumber: submission.levelNumber,
		// 			firstPartCompleted: true,
		// 			fullyCompleted: true,
		// 			completedAt: new Date()
		// 		},
		// 		update: {
		// 			firstPartCompleted: true,
		// 			fullyCompleted: true,
		// 			completedAt: new Date()
		// 		}
		// 	});

		// 	// Update pupil's progress if this is their highest level completed
		// 	await tx.pupil.update({
		// 		where: { id: submission.pupilId },
		// 		data: {
		// 			progress: {
		// 				increment: 1
		// 			}
		// 		}
		// 	});
		// }

		return updated;
	});

	return json(updatedSubmission);
};
