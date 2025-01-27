import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { Actions, PageServerLoad } from './$types';
//import { PrismaClient } from '@prisma/client';
//import type { Level } from '@prisma/client';

// Registration state map: userId -> timestamp
const registrationState = new Map<string, number>();

export const load: PageServerLoad = async ({ locals }) => {
	// Allow access to registration page if user is in registration state
	if (locals.user) {
		if (registrationState.has(locals.user.id)) {
			return { form: null };
		}
		// Otherwise redirect to appropriate page
		if (locals.user.role === 'COACH') {
			throw redirect(302, '/coach');
		} else {
			throw redirect(302, '/app');
		}
	}

	return { form: null };
};

interface ChildData {
	name: string;
	dateOfBirth: string;
	level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
	profilePicture: number;
}

function getChildrenFromFormData(formData: FormData): ChildData[] {
	const children: ChildData[] = [];
	let index = 0;

	while (true) {
		const name = formData.get(`childName${index}`)?.toString().trim();
		const dateOfBirth = formData.get(`dateOfBirth${index}`)?.toString();
		const level = formData.get(`level${index}`)?.toString() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
		const profilePicture = parseInt(formData.get(`profilePicture${index}`)?.toString() || '1');

		if (!name || !dateOfBirth || !level) break;

		children.push({ name, dateOfBirth, level, profilePicture });
		index++;
	}

	return children;
}

export const actions = {
	register: async ({ request, cookies, locals }) => {
		try {
			/* console.log('Starting registration process'); */
			const formData = await request.formData();

			// Parent data
			const email = formData.get('email')?.toString().trim();
			const confirmEmail = formData.get('confirmEmail')?.toString().trim();
			const password = formData.get('password')?.toString();
			const confirmPassword = formData.get('confirmPassword')?.toString();
			const name = formData.get('name')?.toString().trim();
			const phone = formData.get('phone')?.toString().trim();
			const profilePicture = formData.get('profilePicture')?.toString().trim();

			// Get children data
			const children = getChildrenFromFormData(formData);

			// Validate parent data
			if (!email || !confirmEmail || !password || !confirmPassword || !name) {
				return fail(400, {
					error: 'All parent fields are required.',
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

			// Validate children data
			if (children.length === 0) {
				return fail(400, {
					error: 'At least one child is required.',
					name,
					email,
					phone
				});
			}

			for (const child of children) {
				if (!child.name || !child.dateOfBirth || !child.level) {
					return fail(400, {
						error: 'All child fields are required for each child.',
						name,
						email,
						phone
					});
				}
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

			// Get the demo coach
			const coach = await prisma.coach.findFirst({
				where: {
					user: {
						email: 'demo@demo.com'
					}
				}
			});

			if (!coach) {
				return fail(500, {
					error: 'Demo coach not found. Please contact support.',
					name,
					email,
					phone
				});
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			// Create User, Parent, and all Children within a single transaction
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
								phone: phone || null,
								pupils: {
									create: children.map(child => ({
										name: child.name,
										dateOfBirth: new Date(child.dateOfBirth),
										notes: '',
										progress: 0,
										profilePicture: child.profilePicture,
										levelProgress: {
											create: Array.from({ length: 7 }, (_, i) => ({
												levelNumber: i + 1,
												firstPartCompleted: false,
												fullyCompleted: false,
												completedAt: null
											}))
										}
									}))
								}
							}
						},
						notifications: {
							create: {
								timestamp: new Date(),
								isRead: false,
								type: 'META',
								title: `Welkom ${name}!`,
								body: 'Welkom bij WaterAdventure! Je kunt nu beginnen met de zwemlessen.',
								levelNumber: null
							}
						}
					},
					include: {
						parent: {
							include: {
								pupils: true
							}
						}
					}
				});
				return user;
			});

			// Store user info in locals
			locals.user = user;
			if (user.parent) {
				locals.parent = user.parent;
			}

			// Create session
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

			/* console.log('Registration successful, user and pupils created:', {
				userId: user.id,
				email: user.email,
				pupilCount: user.parent?.pupils.length
			}); */

			return { success: true };
		} catch (error) {
			console.error('Registration error:', error);
			return fail(500, { error: 'Registration failed' });
		}
	}
} satisfies Actions;