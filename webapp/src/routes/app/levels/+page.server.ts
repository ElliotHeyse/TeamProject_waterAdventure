import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
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

	// Get selected pupil from URL or default to first pupil
	const selectedPupilId = url.searchParams.get('child') || parent.pupils[0].id;
	const pupil = parent.pupils.find(p => p.id === selectedPupilId);

	if (!pupil) {
		throw error(404, 'Selected pupil not found');
	}

	// Get all swimming lessons with their submissions and level progress
	const lessons = await prisma.lesson.findMany({
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
	for (const lesson of lessons) {
		const submission = lesson.submissions[0];
		if (!submission || (submission.status !== 'REVIEWED' && submission.status !== 'PENDING')) {
			currentLevelOrder = lesson.order;
			break;
		}
		currentLevelOrder = lesson.order + 1;
	}

	// Transform lessons into level data
	const levels = lessons.map(lesson => {
		const submission = lesson.submissions[0];
		const allPartsCompleted = lesson.levelProgress.every(p => p.completed);

		let status: 'locked' | 'current' | 'completed' = 'locked';
		let medal: 'gold' | 'silver' | 'bronze' | null = null;

		// Determine status
		if (submission?.status === 'REVIEWED') {
			status = 'completed';
			// Get medal directly from submission
			if (submission.medal !== 'NONE') {
				medal = submission.medal.toLowerCase() as 'gold' | 'silver' | 'bronze';
			}
		} else if (submission?.status === 'PENDING') {
			status = 'completed'; // Show as completed when video is submitted but pending review
		} else if (lesson.order === currentLevelOrder) {
			status = 'current';
		}

		return {
			id: lesson.order,
			status,
			medal
		};
	});

	// Get all children for the header dropdown
	const children = parent.pupils.map(pupil => ({
		id: pupil.id,
		name: pupil.name
	}));

	return {
		levels: levels.sort((a, b) => a.id - b.id), // Sort in ascending order
		children // Add children to the response for the header dropdown
	};
}; 