import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { Actions, PageServerLoad } from './$types';

// Global registration state map: userId -> timestamp
let registrationState: boolean = false;

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        if (!registrationState) {
            if (locals.user.role === 'COACH') {
                throw redirect(302, '/coach');
            } else {
                throw redirect(302, '/app');
            }
        }
    }

    return { form: null };
};

export const actions = {
	login: async ({ request, cookies, locals }) => {
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

			// Return success for registration flow, redirect for normal login
			const isRegistrationFlow = formData.get('isRegistrationFlow')?.toString() === 'true';
			if (isRegistrationFlow) {
				return { success: true };
			} else {
				throw redirect(303, '/app');
			}
		} catch (error) {
			if (error instanceof Error && !(error instanceof Response)) {
				return fail(500, {
					error: 'An error occurred while processing your request. Please try again.',
					email: formData?.get('email')?.toString()
				});
			}
			throw error;
		}
	},

	register: async ({ request, cookies, locals }) => {
		let registrationState = true;
		try {
			console.log('Starting registration process');
			const formData = await request.formData();
			const email = formData.get('email')?.toString().trim();
			const confirmEmail = formData.get('confirmEmail')?.toString().trim();
			const password = formData.get('password')?.toString();
			const confirmPassword = formData.get('confirmPassword')?.toString();
			const name = formData.get('name')?.toString().trim();
			const phone = formData.get('phone')?.toString().trim();

			if (!email || !confirmEmail || !password || !confirmPassword || !name) {
				return fail(400, {
					error: 'All fields are required.',
					name,
					email,
					phone
				});
			}

			if (email !== confirmEmail) {
				return fail(400, {
					error: 'Emails do not match.',
					name,
					email,
					phone
				});
			}

			if (password !== confirmPassword) {
				return fail(400, {
					error: 'Passwords do not match.',
					name,
					email,
					phone
				});
			}

			const existingUser = await prisma.user.findUnique({ where: { email } });
			if (existingUser) {
				return fail(400, {
					error: 'Email is already registered.',
					name,
					email,
					phone
				});
			}

			// Find coach with least number of pupils
			const coach = await prisma.coach.findFirst({
				orderBy: {
					pupils: {
						_count: 'asc'
					}
				}
			});

			if (!coach) {
				return fail(500, {
					error: 'No coaches available. Please try again later.',
					name,
					email,
					phone
				});
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			// Create User and Parent within a transaction
			const user = await prisma.$transaction(async (prisma) => {
				const user = await prisma.user.create({
					data: {
						email,
						name,
						password: hashedPassword,
						role: 'PARENT',
						parent: {
							create: {
								coachId: coach.id,
								phone: phone || null
							}
						}
					},
					include: {
						parent: true
					}
				});
				return user;
			});

			// Store user info in locals
			locals.user = user;
			if (user.parent) {
				locals.parent = user.parent;
			}

			// Create initial session token
			const token = randomBytes(32).toString('hex');
			const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

			const session = await prisma.session.create({
				data: {
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

			// Add to registration state with 30-minute expiry
			//registrationState.set(user.id, Date.now() + 30 * 60 * 1000);

			console.log('Registration successful, user created:', { id: user.id, email: user.email });
			return { success: true };
		} catch (error) {
			console.error('Registration error:', error);
			return fail(500, { error: 'Registration failed' });
		}
	},

	addChild: async ({ request, cookies, locals }) => {
		console.log('addChild handler called');

		if (!locals.user || !locals.parent) {
			console.log('No user or parent in locals');
			return fail(403, { error: 'Not authorized' });
		}

		// Check registration state
		//const expiryTime = registrationState.get(locals.user.id);
		//if (!expiryTime || Date.now() > expiryTime) {
		//	console.log('Registration state expired or not found');
		//	//registrationState.delete(locals.user.id);
		//	registrationState = false;
		//	return fail(403, { error: 'Registration session expired' });
		//}

		try {
			console.log('Processing form data');
			const formData = await request.formData();
			console.log('Raw form data:', Object.fromEntries(formData.entries()));

			const name = formData.get('childName')?.toString().trim();
			const dateOfBirth = formData.get('dateOfBirth')?.toString();
			const level = formData.get('level')?.toString() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

			console.log('Form data received:', { name, dateOfBirth, level });

			if (!name || !dateOfBirth || !level) {
				console.log('Validation failed:', { name, dateOfBirth, level });
				return fail(400, {
					error: 'All fields are required.',
					name,
					dateOfBirth,
					level
				});
			}

			if (!locals.parent.coachId) {
				console.log('No coach assigned to parent');
				return fail(500, { error: 'No coach assigned to parent' });
			}

			console.log('Creating pupil with data:', {
				name,
				dateOfBirth,
				level,
				parentId: locals.parent.id,
				coachId: locals.parent.coachId
			});

			const pupil = await prisma.pupil.create({
				data: {
					name,
					dateOfBirth: new Date(dateOfBirth),
					level,
					parentId: locals.parent.id,
					coachId: locals.parent.coachId,
					notes: ''
				}
			});

			// Remove from registration state
			//registrationState.delete(locals.user.id);
			registrationState = false;
			return { success: true };

		} catch (error) {
			console.error('Add Child Error:', error);
			return fail(500, { error: 'Failed to add child' });
		}
	}
} satisfies Actions;