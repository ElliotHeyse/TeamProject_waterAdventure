import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { Submission as PrismaSubmission, Pupil, Lesson } from '@prisma/client';

type SubmissionWithRelations = PrismaSubmission & {
	pupil: Pupil;
	lesson: Lesson;
};

export const load: PageServerLoad = async ({ locals }) => {
	const submissions = await prisma.submission.findMany({
		include: {
			pupil: true,
			lesson: true
		},
		orderBy: {
			createdAt: 'desc'
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
			feedback: submission.feedback || ''
		}))
	};
};
