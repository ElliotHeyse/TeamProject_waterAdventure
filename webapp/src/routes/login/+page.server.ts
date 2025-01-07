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
		const data = await request.formData();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();

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

		try {
			// Create a new session
			const token = randomBytes(32).toString('hex');
			const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

			const session = await prisma.session.create({
				data: {
					token,
					userId: user.id,
					expiresAt: twoDaysFromNow
				}
			});

			// Set session cookie
			cookies.set('session', session.token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 2 // 2 days
			});

			// Redirect based on role
			if (user.role === 'COACH') {
				throw redirect(302, '/coach');
			} else {
				throw redirect(302, '/app');
			}
		} catch (error) {
			console.error('Session creation failed:', error);
			return fail(500, { 
				error: 'An error occurred during login. Please try again.',
				email
			});
		}
	}
} satisfies Actions; 