import { prisma } from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const { feedback } = await request.json();
	const { id } = params;

	const submission = await prisma.submission.update({
		where: { id },
		data: {
			status: 'REVIEWED',
			feedback,
			review: {
				create: {
					coachId: 'TODO: Get coach ID from session',
					comment: feedback,
					rating: 0
				}
			}
		}
	});

	return json({ success: true, submission });
};
