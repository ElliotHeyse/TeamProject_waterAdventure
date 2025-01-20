import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
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
	default: async ({ request, cookies, locals }) => {
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
				where: { email },
				include: {
					parent: true
				}
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
				return fail(400, {
					error: 'Invalid email or password',
					email
				});
			}

			const token = randomBytes(32).toString('hex');
			const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

			const session = await prisma.session.create({
				data: {
					token,
					userId: user.id,
					expiresAt: twoDaysFromNow
				}
			});

			const sessionToken = session.token;

			// Set session cookie
			cookies.set('session', sessionToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 2 // 2 days
			});

			locals.user = user;
			if (user.parent) {
				locals.parent = user.parent;
			}

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