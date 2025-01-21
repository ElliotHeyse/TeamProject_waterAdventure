import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { Submission as PrismaSubmission, Pupil, Level, LevelLanguageContent } from '@prisma/client';

type SubmissionWithRelations = PrismaSubmission & {
	pupil: Pupil;
	level: Level & {
		languageContents: LevelLanguageContent[];
	};
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const lessonId = url.searchParams.get('lessonId');

	const submissions = await prisma.submission.findMany({
		where: lessonId ? {
			level: {
				id: lessonId
			}
		} : undefined,
		include: {
			pupil: true,
			level: {
				include: {
					languageContents: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	// Get all unique lessons for the filter dropdown
	const levels = await prisma.level.findMany({
		select: {
			id: true,
			languageContents: {
				select: {
					title: true
				}
			}
		}
	});

	return {
		submissions: submissions.map((submission: SubmissionWithRelations) => ({
			id: submission.id,
			pupilName: submission.pupil.name,
			lessonTitle: submission.level.languageContents[0].title,
			date: submission.createdAt.toISOString().split('T')[0],
			status: submission.status.toLowerCase(),
			videoUrl: submission.videoUrl,
			feedback: submission.feedback || '',
			medal: submission.medal,
			level: submission.level
		})),
		levels
	};
};
