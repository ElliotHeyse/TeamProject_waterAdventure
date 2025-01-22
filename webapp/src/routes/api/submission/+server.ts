import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const pupilId = formData.get('pupilId') as string;
	const levelNumber = formData.get('levelNumber') as string;
	const videoUrl = formData.get('videoUrl') as string;

	if (!pupilId || !levelNumber || !videoUrl) {
		throw error(400, 'Missing required fields');
	}

	console.info("API[submission]: request received");

	try {
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
			console.warn("API[submission]: Failed to create submission, throwing 500 error");
			throw error(500, 'Failed to create submission');
		}

		console.info("API[submission]: successfully processed request");
		return json({ success: submission });
	} catch (e) {
		console.error('API[submission]: Failed to create submission:', e);
		throw error(500, 'Failed to create submission');
	}
};