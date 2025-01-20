import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Get the pupil ID from the user's relations
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

	// Find the lesson by order number
	const lesson = await prisma.lesson.findFirst({
		where: {
			isSwimmingLesson: true,
			order: parseInt(params.id)
		},
		include: {
			exercises: {
				include: {
					videos: true
				}
			},
			submissions: {
				where: {
					pupilId: pupilId
				},
				include: {
					lesson: {
						include: {
							coach: {
								include: {
									user: true
								}
							}
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: 1
			},
			levelProgress: {
				where: {
					pupilId: pupilId
				}
			}
		}
	});

	if (!lesson) {
		throw error(404, 'Lesson not found');
	}

	// Combine exercises with their progress
	const exercisesWithProgress = lesson.exercises.map(exercise => ({
		...exercise,
		title: exercise.name, // Map name to title for frontend consistency
		completed: lesson.levelProgress.some(p => p.part === exercise.part && p.completed)
	}));

	const submission = lesson.submissions[0];
	const reviewInfo = submission?.status === 'REVIEWED' ? {
		feedback: submission.feedback,
		medal: submission.medal,
		reviewedAt: submission.updatedAt,
		teacherName: submission.lesson.coach.user.name
	} : null;

	return {
		lesson: {
			id: lesson.id,
			title: lesson.title,
			objective: lesson.objective || '',
			exercises: exercisesWithProgress
		},
		progress: lesson.levelProgress,
		submission: submission ? {
			id: submission.id,
			videoUrl: submission.videoUrl,
			status: submission.status,
			reviewInfo
		} : null
	};
};