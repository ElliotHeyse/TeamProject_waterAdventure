import { redirect, type Handle } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
	// Get the session cookie
	const session = event.cookies.get('session');

	if (!session) {
		// If there's no session and we're trying to access a protected route
		if (event.url.pathname.startsWith('/coach')) {
			throw redirect(302, '/login');
		}
	} else {
		// Get the user from the session
		const user = await prisma.user.findUnique({
			where: { id: session }
		});

		if (user) {
			// Add the user to the event.locals
			event.locals.user = user;

			// If user is not a coach and trying to access coach routes
			if (user.role !== 'COACH' && event.url.pathname.startsWith('/coach')) {
				throw redirect(302, '/app');
			}
		} else {
			// Invalid session, clear it
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
}; 