import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies, locals }) => {
	// Delete the session from the database if it exists
	if (locals.user) {
		await prisma.session.delete({
			where: {
				userId: locals.user.id
			}
		});
	}

	// Clear the session cookie
	cookies.delete('session', { path: '/' });

	// Redirect to the login page
	throw redirect(303, '/login');
}; 