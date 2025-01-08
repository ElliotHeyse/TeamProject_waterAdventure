import { prisma } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import type { LessonsPageData } from '$lib/types/lessons';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	const lessons = await prisma.lesson.findMany({
		orderBy: [{ date: 'asc' }, { title: 'asc' }]
	});

	return { lessons };
}) satisfies PageServerLoad;

export const actions = {
	createLesson: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const level = formData.get('level') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
		const duration = parseInt(formData.get('duration') as string);
		const date = formData.get('date') as string;
		const maxPupils = parseInt(formData.get('maxPupils') as string);

		if (!title || !description || !level || !duration || !date || !maxPupils) {
			return fail(400, { message: 'Missing required fields' });
		}

		// Get the coach ID (you'll need to implement proper auth later)
		const coach = await prisma.coach.findFirst();
		if (!coach) {
			return fail(500, { message: 'No coach found' });
		}

		try {
			await prisma.lesson.create({
				data: {
					title,
					description,
					level,
					duration,
					date: new Date(date),
					coachId: coach.id
				}
			});
		} catch (error) {
			console.error('Failed to create lesson:', error);
			return fail(500, { message: 'Failed to create lesson' });
		}

		return { success: true };
	},
	deleteLesson: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'Missing lesson ID' });
		}

		try {
			// First, delete all reviews associated with submissions of this lesson
			await prisma.review.deleteMany({
				where: {
					submission: {
						lessonId: id
					}
				}
			});

			// Then delete all submissions for this lesson
			await prisma.submission.deleteMany({
				where: { lessonId: id }
			});

			// Finally delete the lesson
			await prisma.lesson.delete({
				where: { id }
			});
			return { success: true };
		} catch (error) {
			console.error('Failed to delete lesson:', error);
			return fail(500, { message: 'Failed to delete lesson' });
		}
	}
} satisfies Actions;
