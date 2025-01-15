import { prisma } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const lessonId = formData.get('lessonId') as string;
	const videoUrl = formData.get('videoUrl') as string;

	if (!lessonId || !videoUrl) {
		throw error(400, 'Missing required fields');
	}

	// Get the pupil ID from the parent relationship
	const parent = await prisma.parent.findUnique({
		where: {
			userId: locals.user.id
		},
		include: {
			pupils: {
				take: 1
			}
		}
	});

	if (!parent || !parent.pupils[0]) {
		throw error(404, 'No pupil found');
	}

	const pupilId = parent.pupils[0].id;

	try {
		// Create the submission
		const submission = await prisma.submission.create({
			data: {
				lessonId,
				pupilId,
				videoUrl,
				status: 'PENDING'
			}
		});

		// Get the lesson order to determine next level
		const lesson = await prisma.lesson.findUnique({
			where: { id: lessonId },
			select: { order: true }
		});

		if (!lesson) {
			throw error(404, 'Lesson not found');
		}

		// Find the next lesson and update its status
		const nextLesson = await prisma.lesson.findFirst({
			where: {
				isSwimmingLesson: true,
				order: lesson.order + 1
			},
			include: {
				exercises: true
			}
		});

		if (nextLesson && nextLesson.exercises.length > 0) {
			// Create level progress entries for the next level
			await prisma.levelProgress.createMany({
				data: nextLesson.exercises.map(exercise => ({
					pupilId,
					lessonId: nextLesson.id,
					part: exercise.part,
					completed: false
				})),
				skipDuplicates: true
			});
		}

		return json({ success: true, submission });
	} catch (e) {
		console.error('Failed to create submission:', e);
		throw error(500, 'Failed to create submission');
	}
}; 