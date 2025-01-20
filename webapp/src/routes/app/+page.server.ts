import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Get the parent with all their pupils
	const parent = await prisma.parent.findUnique({
		where: {
			userId: locals.user.id
		},
		include: {
			pupils: true
		}
	});

	if (!parent || parent.pupils.length === 0) {
		throw error(404, 'No pupils found');
	}

	// Get all swimming lessons
	const lessons = await prisma.lesson.findMany({
		where: {
			isSwimmingLesson: true,
		},
		orderBy: {
			order: 'asc'
		}
	});

	// For each pupil, get their progress and latest review
	const children = await Promise.all(parent.pupils.map(async (pupil) => {
		// Get submissions and progress for this pupil
		const lessonsWithProgress = await prisma.lesson.findMany({
			where: {
				isSwimmingLesson: true,
			},
			orderBy: {
				order: 'asc'
			},
			include: {
				submissions: {
					where: {
						pupilId: pupil.id
					},
					orderBy: {
						createdAt: 'desc'
					},
					take: 1
				},
				levelProgress: {
					where: {
						pupilId: pupil.id
					}
				}
			}
		});

		// Find the first incomplete level's order
		let currentLevelOrder = 1;
		for (const lesson of lessonsWithProgress) {
			const submission = lesson.submissions[0];
			if (!submission || (submission.status !== 'REVIEWED' && submission.status !== 'PENDING')) {
				currentLevelOrder = lesson.order;
				break;
			}
			currentLevelOrder = lesson.order + 1;
		}

		// Get the latest review for this pupil
		const latestReview = await prisma.submission.findFirst({
			where: {
				pupilId: pupil.id,
				status: 'REVIEWED'
			},
			orderBy: {
				updatedAt: 'desc'
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
			}
		});

		return {
			id: pupil.id,
			name: pupil.name,
			currentLevel: pupil.level,
			currentLevelOrder,
			latestReview: latestReview ? {
				lessonOrder: latestReview.lesson.order,
				updatedAt: latestReview.updatedAt,
				review: {
					feedback: latestReview.feedback,
					coach: {
						user: {
							name: latestReview.lesson.coach.user.name
						}
					}
				}
			} : undefined
		};
	}));

	// Sort children to ensure consistent order (first child first)
	children.sort((a, b) => a.name.localeCompare(b.name));

	return {
		children
	};
};