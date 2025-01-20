import { i18n } from '$lib/i18n'
import { sequence } from '@sveltejs/kit/hooks'
import { redirect, type Handle } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
	sequence(i18n.handle())

	// Get the session token from cookie
	const sessionToken = event.cookies.get('session');
	const path = event.url.pathname;

	// Check if trying to access protected routes
	const isProtectedRoute = path.startsWith('/coach') || path.startsWith('/app');
	const isLoginPage = path === '/login';

	if (!sessionToken && isProtectedRoute) {
		// Redirect to login if no session and trying to access protected routes
		throw redirect(302, '/login');
	}

	if (sessionToken) {
		// Get the session and related user
		const session = await prisma.session.findUnique({
			where: {
				token: sessionToken,
				expiresAt: { gt: new Date() }
			},
			include: {
				user: {
					include: {
						parent: true
					}
				}
			}
		});

		if (session?.user) {
			// Add the user to the event.locals
			event.locals.user = session.user;

			// Add parent data if user is a parent
			if (session.user.role === 'PARENT') {
				event.locals.parent = session.user.parent;
			}

			// Handle role-based access
			if (session.user.role !== 'COACH' && path.startsWith('/coach')) {
				throw redirect(302, '/app');
			}
			if (session.user.role === 'COACH' && path.startsWith('/app')) {
				throw redirect(302, '/coach');
			}

			// Redirect logged-in users from login page
			if (isLoginPage) {
				throw redirect(302, session.user.role === 'COACH' ? '/coach' : '/app');
			}
		} else {
			// Invalid or expired session, clean it up
			event.cookies.delete('session', { path: '/' });

			// Clean up expired sessions for this token
			if (sessionToken) {
				console.log('Cleaning up expired session:', sessionToken);
				await prisma.session.deleteMany({
					where: {
						OR: [
							{ token: sessionToken },
							{ expiresAt: { lte: new Date() } }
						]
					}
				});
			}

			if (isProtectedRoute) {
				throw redirect(302, '/login');
			}
		}
	}

	return resolve(event);
};