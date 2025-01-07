import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import bcrypt from 'bcrypt';
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
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, { error: 'Missing email or password' });
		}

		const user = await prisma.user.findUnique({
			where: { email: email.toString() }
		});

		if (!user) {
			return fail(400, { error: 'Invalid email or password' });
		}

		const validPassword = await bcrypt.compare(password.toString(), user.password);

		if (!validPassword) {
			return fail(400, { error: 'Invalid email or password' });
		}

		// Set session cookie
		cookies.set('session', user.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		// Redirect based on role
		if (user.role === 'COACH') {
			throw redirect(302, '/coach');
		} else {
			throw redirect(302, '/app');
		}
	}
} satisfies Actions; 