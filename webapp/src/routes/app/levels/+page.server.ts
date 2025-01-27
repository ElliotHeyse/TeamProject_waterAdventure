import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// region DATA ACCESS

	// Get the parent user, with their notifications, settings, messages and pupils, with their levelProgress and submissions
	const parentUser = await prisma.user.findUnique({
		where: {
			id: locals.user.id
		},
		include: {
			parent: {
				include: {
					pupils: {
						include: {
							levelProgress: true,
							submissions: true
						}
					},
					messages: true
				}
			},
			settings: true,
			notifications: true
		}
	});

	if (!parentUser || !parentUser.parent) {
		console.warn('No parent found', locals.user.id);
		throw error(404, 'No parent found');
	} else if (!parentUser.parent.pupils || parentUser.parent.pupils.length === 0) {
		console.warn('No pupils found for parent', locals.user.id);
		throw error(404, 'No pupils found');
	}

	// Get all levels, with their languageContents and exercises, with their videos and languageContents
	const levels = await prisma.level.findMany({
		include: {
			languageContents: true,
			exercises: {
				include: {
					videos: true,
					languageContents: true
				}
			}
		},
		orderBy: {
			levelNumber: 'asc'
		}
	});

	if (!levels || levels.length === 0) {
		console.warn('No levels found');
		throw error(404, 'No levels found');
	}

	// region DATA PROCESSING

	// Trim the parent user object to only include the necessary data
	const parentUserTrimmed = {
		id: parentUser.id,
		email: parentUser.email,
		name: parentUser.name,
		parent: {
			id: parentUser.parent.id,
			phone: parentUser.parent.phone,
			coachId: parentUser.parent.coachId,
			pupils: parentUser.parent.pupils.map(pupil => ({
				id: pupil.id,
				name: pupil.name,
				progress: pupil.progress,
				profilePicture: pupil.profilePicture,
				levelProgress: pupil.levelProgress.map(levelProgress => ({
					id: levelProgress.id,
					firstPartCompleted: levelProgress.firstPartCompleted,
					fullyCompleted: levelProgress.fullyCompleted,
					levelNumber: levelProgress.levelNumber
				})),
				submissions: pupil.submissions.map(submission => ({
					id: submission.id,
					videoUrl: submission.videoUrl,
					status: submission.status,
					feedback: submission.feedback,
					medal: submission.medal,
					updatedAt: submission.updatedAt,
					levelNumber: submission.levelNumber
				}))
			})),
			messages: parentUser.parent.messages.map(message => ({
				id: message.id,
				content: message.content,
				isRead: message.isRead,
				sender: message.sender,
				createdAt: message.createdAt,
				coachId: message.coachId
			}))
		},
		settings: {
			pushNotifications: parentUser.settings?.pushNotifications,
			emailNotifications: parentUser.settings?.emailNotifications,
			theme: parentUser.settings?.theme,
			language: parentUser.settings?.language
		},
		notifications: parentUser.notifications.map(notification => ({
			id: notification.id,
			timestamp: notification.timestamp,
			isRead: notification.isRead,
			type: notification.type,
			title: notification.title,
			body: notification.body,
			levelNumber: notification.levelNumber
		}))
	};

	// Trim the levels object to only include the necessary data
	const levelsTrimmed = levels.map(level => ({
		id: level.id,
		duration: level.duration,
		levelNumber: level.levelNumber,
		exercises: level.exercises.map(exercise => ({
			id: exercise.id,
			exerciseNumber: exercise.exerciseNumber,
			videos: exercise.videos.map(video => ({
				id: video.id,
				path: video.path,
				title: video.title
			})),
			languageContents: exercise.languageContents.map(languageContent => ({
				id: languageContent.id,
				language: languageContent.language,
				location: languageContent.location,
				title: languageContent.title,
				description: languageContent.description,
				important: languageContent.important,
				tips: languageContent.tips
			}))
		})),
		languageContents: level.languageContents.map(languageContent => ({
			id: languageContent.id,
			language: languageContent.language,
			title: languageContent.title,
			objectives: languageContent.objectives,
		}))
	}));

	// region DATA RETURN
	return {
		parentUser: parentUserTrimmed,
		levels: levelsTrimmed
	}
};