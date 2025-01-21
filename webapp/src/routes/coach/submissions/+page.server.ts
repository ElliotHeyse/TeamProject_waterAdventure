import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { Submission as PrismaSubmission, Pupil, Level, LevelLanguageContent } from '@prisma/client';

type SubmissionWithRelations = PrismaSubmission & {
	pupil: Pupil;
	level: Level & {
		languageContents: LevelLanguageContent[];
	};
};

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}

	const coach = await prisma.coach.findUnique({
		where: { userId: locals.user.id },
		include: {
			parents: true
		}
	});

	if (!coach) {
		throw new Error('Coach not found');
	}

	const parentIds = coach.parents.map(parent => parent.id);

	const submissions = await prisma.submission.findMany({
		where: {
			pupil: {
				parent: {
					id: {
						in: parentIds
					}
				}
			}
		},
		include: {
			pupil: true,
			level: {
				include: {
					languageContents: {
						where: {
							language: 'nl'
						},
						take: 1
					}
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	return {
		submissions: submissions.map((submission: SubmissionWithRelations) => ({
			id: submission.id,
			pupilName: submission.pupil.name,
			levelNumber: submission.level.levelNumber,
			levelTitle: submission.level.languageContents[0]?.title || `Level ${submission.level.levelNumber}`,
			date: submission.createdAt.toISOString().split('T')[0],
			status: submission.status.toLowerCase(),
			videoUrl: submission.videoUrl,
			feedback: submission.feedback || '',
			medal: submission.medal
		}))
	};
};
