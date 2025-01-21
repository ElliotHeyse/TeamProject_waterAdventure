import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { userInfo } from 'os';
import { duration, language, pupils } from '$lib/paraglide/messages';

export const load: PageServerLoad = async ({ locals }) => {
	// region AUTHENTICATION
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	// } else {
	// 	console.info(locals.user); // dev flag
	}

	// parent is already loaded in the user object, but this code gives an error
	// const parent = locals.user.parent;

	// region DATA ACCESS

	// Get the parent user, with their notifications, settings and pupils (not with their levelProgress and submissions)
	const parentUser = await prisma.user.findUnique({
		where: {
			id: locals.user.id
		},
		include: {
			parent: {
				include: {
					pupils: true
				}
			},
			settings: true,
			notifications: true
		}
	});

	if (!parentUser || !parentUser.parent) {
		console.warn('No parent found', locals.user.id); // dev flag
		throw error(404, 'No parent found');
	} else if (!parentUser.parent.pupils || parentUser.parent.pupils.length === 0) {
		console.warn('No pupils found for parent', locals.user.id); // dev flag
		throw error(404, 'No pupils found');
	} else {
		console.info('Parent found'); // dev flag
		// console.log(parentUser); // dev flag
		// console.log(parentUser.parent); // dev flag
		// console.log(parentUser.parent.pupils); // dev flag
		// console.log(parentUser.settings); // dev flag
		// console.log(parentUser.notifications); // dev flag
	}

	// Get all levels, with their textual content (not with their exercises)
	const levels = await prisma.level.findMany({
		include: {
			languageContents: true
		},
		orderBy: {
			levelNumber: 'asc'
		}
	});

	if (!levels || levels.length === 0) {
		console.warn('No levels found'); // dev flag
		throw error(404, 'No levels found');
	} else {
		console.info('Levels found'); // dev flag
		// console.log(levels[0]); // dev flag
		// console.log(levels[0].languageContents); // dev flag
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
				progress: pupil.progress
			}))
		},
		settings: {
			pushNotifications: parentUser.settings?.pushNotifications,
			emailNotifications: parentUser.settings?.emailNotifications,
			theme: parentUser.settings?.theme,
			language: parentUser.settings?.language
		},
		notifications: parentUser.notifications.map(notification => ({
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
		duration: level.duration,
		levelNumber: level.levelNumber,
		languageContents: level.languageContents.map(languageContent => ({
			language: languageContent.language,
			title: languageContent.title,
			objectives: languageContent.objectives,
		}))
	}));


	// region DATA RETURN

	// const returnObject = { // dev flag
	// 	parentUser: parentUserTrimmed, // dev flag
	// 	levels: levelsTrimmed // dev flag
	// } // dev flag
	// console.info(returnObject); // dev flag
	// console.info(returnObject.parentUser); // dev flag
	// console.info(returnObject.parentUser.parent.pupils[0]); // dev flag

	// console.info(returnObject.levels); // dev flag
	// console.info(returnObject.levels[0].languageContents[0]); // dev flag

	return {
		parentUser: parentUser,
		levels: levels
	}
};