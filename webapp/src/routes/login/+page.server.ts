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
	login: async ({ request, cookies, locals }) => {
		try {
			const formData = await request.formData();
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

			// Use upsert to handle the unique constraint
			const session = await prisma.session.upsert({
				where: {
					userId: user.id
				},
				update: {
					token,
					expiresAt: twoDaysFromNow
				},
				create: {
					token,
					userId: user.id,
					expiresAt: twoDaysFromNow
				}
			});

			cookies.set('session', session.token, {
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

			throw redirect(303, '/app');
		} catch (error) {
			console.error('Login error:', error);
			if (error instanceof Error && !(error instanceof Response)) {
				return fail(500, {
					error: 'An error occurred while processing your request. Please try again.'
				});
			}
			throw error;
		}
	}
} satisfies Actions;