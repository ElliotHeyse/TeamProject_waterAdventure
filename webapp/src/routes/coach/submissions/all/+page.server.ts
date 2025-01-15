import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { Submission as PrismaSubmission, Pupil, Lesson } from '@prisma/client';

type SubmissionWithRelations = PrismaSubmission & {
	pupil: Pupil;
	lesson: Lesson;
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const lessonId = url.searchParams.get('lessonId');

	const submissions = await prisma.submission.findMany({
		where: lessonId ? {
			lessonId: lessonId
		} : undefined,
		include: {
			pupil: true,
			lesson: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	// Get all unique lessons for the filter dropdown
	const lessons = await prisma.lesson.findMany({
		select: {
			id: true,
			title: true
		},
		orderBy: {
			title: 'asc'
		}
	});

	return {
		submissions: submissions.map((submission: SubmissionWithRelations) => ({
			id: submission.id,
			pupilName: submission.pupil.name,
			lessonTitle: submission.lesson.title,
			date: submission.createdAt.toISOString().split('T')[0],
			status: submission.status.toLowerCase(),
			videoUrl: submission.videoUrl,
			feedback: submission.feedback || '',
			medal: submission.medal,
			lesson: submission.lesson
		})),
		lessons
	};
};
