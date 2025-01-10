import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const { feedback } = await request.json();
	const { id } = params;

	try {
		await prisma.submission.update({
			where: { id },
			data: {
				feedback,
				status: 'REVIEWED'
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error submitting review:', error);
		return json({ error: 'Failed to submit review' }, { status: 500 });
	}
};
