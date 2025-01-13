import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is already logged in, redirect to appropriate page
	if (locals.user) {
		if (locals.user.role === 'COACH') {
			throw redirect(302, '/coach');
		} else {
			throw redirect(302, '/app');
		}
	}

	return { form: null };
};

export const actions = {
	default: async ({ request, cookies }) => {
		let formData;
		try {
			formData = await request.formData();
			const email = formData.get('email')?.toString();
			const password = formData.get('password')?.toString();

			if (!email || !password) {
				return fail(400, {
					error: 'Please enter both email and password',
					email
				});
			}

			const user = await prisma.user.findUnique({
				where: { email }
			});

			if (!user) {
				//console.log('Login failed: User not found:', email);
				return fail(400, {
					error: 'Invalid email or password',
					email
				});
			}

			const validPassword = await bcrypt.compare(password, user.password);

			if (!validPassword) {
				//console.log('Login failed: Invalid password for user:', email);
				return fail(400, {
					error: 'Invalid email or password',
					email
				});
			}

			// Check for existing valid session first
			const existingSession = await prisma.session.findFirst({
				where: {
					userId: user.id,
					expiresAt: {
						gt: new Date()
					}
				}
			});

			let sessionToken;
			if (existingSession) {
				console.log('Using existing valid session for user:', email);
				sessionToken = existingSession.token;
			} else {
				console.log('No valid session found, creating new session for user:', email);
				// Clean up expired sessions for this user
				const deletedSessions = await prisma.session.deleteMany({
					where: {
						userId: user.id,
						expiresAt: {
							lte: new Date()
						}
					}
				});
				console.log('Cleaned up expired sessions:', deletedSessions.count);

				// Create new session
				const token = randomBytes(32).toString('hex');
				const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

				const session = await prisma.session.create({
					data: {
						token,
						userId: user.id,
						expiresAt: twoDaysFromNow
					}
				});
				console.log('Created new session for user:', email);
				sessionToken = session.token;
			}

			// Set session cookie
			cookies.set('session', sessionToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 2 // 2 days
			});

			//console.log('Login successful for user:', email);
			//console.log('Redirecting to:', user.role === 'COACH' ? '/coach' : '/app');

			// Use throw redirect to ensure proper handling
			throw redirect(303, user.role === 'COACH' ? '/coach' : '/app');
		} catch (error) {
			// Only handle non-redirect errors
			if (error instanceof Error && !(error instanceof Response)) {
				//console.error('Login error:', error);
				return fail(500, {
					error: 'An error occurred while processing your request. Please try again.',
					email: formData?.get('email')?.toString()
				});
			}
			throw error; // Re-throw redirect responses
		}
	}
} satisfies Actions;