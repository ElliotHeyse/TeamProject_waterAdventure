import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Create uploads directory if it doesn't exist
// const UPLOAD_DIR = 'static/uploads/videos';
const UPLOAD_DIR = 'build/client/uploads/videos';
await mkdir(UPLOAD_DIR, { recursive: true });

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const pupilId = formData.get('pupilId') as string;
	const levelNumber = formData.get('levelNumber') as string;
	const videoFile = formData.get('video') as File;

	if (!pupilId || !levelNumber || !videoFile) {
		throw error(400, 'Missing required fields');
	}

	console.info("API[submission]: request received");

	try {
		// Generate unique filename
		const timestamp = Date.now();
		const filename = `${pupilId}_level${levelNumber}_${timestamp}${getFileExtension(videoFile.name)}`;
		const filepath = join(UPLOAD_DIR, filename);

		// Save file to disk
		const arrayBuffer = await videoFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await writeFile(filepath, buffer);

		// Save submission to database with local file path
		const submission = await prisma.submission.create({
			data: {
				videoUrl: `/uploads/videos/${filename}`, // URL path relative to static directory
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

function getFileExtension(filename: string): string {
	const ext = filename.split('.').pop();
	return ext ? `.${ext}` : '';
}