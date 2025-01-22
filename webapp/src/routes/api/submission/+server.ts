import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	console.info("API: submission request received")

	const formData = await request.formData();
	const pupilId = formData.get('pupilId') as string;
	const levelNumber = formData.get('levelNumber') as string;
	const videoUrl = formData.get('videoUrl') as string;

	if (!pupilId || !levelNumber || !videoUrl) {
		console.warn("Missing required fields")
		throw error(400, 'Missing required fields');
	}

	console.log(videoUrl);

	try {
		// Create the submission
		console.info("Creating submission in DB");
		const submission = await prisma.submission.create({
			data: {
				videoUrl: videoUrl,
				status: 'PENDING',
				medal: 'NONE',
				levelNumber: parseInt(levelNumber),
				pupilId: pupilId
			}
		});

		if (!submission) {
			console.warn("Failed to create submission")
			throw error(500, 'Failed to create submission');
		}

		console.info("Submission created:", submission);
		return json({ success: submission });
	} catch (e) {
		console.error('Failed to create submission:', e);
		throw error(500, 'Failed to create submission');
	}
};