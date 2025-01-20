import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { DashboardData } from './types';

export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw new Error('Not authenticated');
	}

	const coach = await prisma.coach.findUnique({
		where: { userId: locals.user.id }
	});

	if (!coach) {
		throw new Error('Coach not found');
	}

	const [totalPupils, activeLessons, pendingSubmissions, unreadMessages, recentActivity] =
		await Promise.all([
			// Get total pupils count
			prisma.pupil.count({
				where: {
					coachId: coach.id
				}
			}),

			// Get active lessons (future lessons)
			prisma.lesson.count({
				where: {
					coachId: coach.id,
					date: {
						gte: new Date()
					}
				}
			}),

			// Get pending submissions count
			prisma.submission.count({
				where: {
					status: 'PENDING',
					pupil: {
						coachId: coach.id
					}
				}
			}),

			// Get unread messages count
			prisma.message.count({
				where: {
					coachId: coach.id,
					read: false
				}
			}),

			// Get recent activity (submissions, messages, and lessons)
			Promise.all([
				// Recent submissions
				prisma.submission.findMany({
					where: {
						pupil: {
							coachId: coach.id
						}
					},
					take: 3,
					orderBy: { createdAt: 'desc' },
					include: {
						pupil: true,
						lesson: true
					}
				}),
				// Recent messages
				prisma.message.findMany({
					where: {
						coachId: coach.id
					},
					take: 3,
					orderBy: { createdAt: 'desc' },
					include: {
						parent: {
							include: {
								user: true
							}
						}
					}
				}),
				// Recent lessons
				prisma.lesson.findMany({
					where: {
						coachId: coach.id
					},
					take: 3,
					orderBy: { createdAt: 'desc' }
				})
			]).then(([submissions, messages, lessons]) => {
				return [
					...submissions.map((s) => ({
						type: 'submission' as const,
						text: `New video submission from ${s.pupil.name} for ${s.lesson.title}`,
						time: s.createdAt
					})),
					...messages.map((m) => ({
						type: 'message' as const,
						text: `Message from ${m.parent.user.name}`,
						time: m.createdAt
					})),
					...lessons.map((l) => ({
						type: 'lesson' as const,
						text: `New lesson scheduled: ${l.title}`,
						time: l.createdAt
					}))
				]
					.sort((a, b) => b.time.getTime() - a.time.getTime())
					.slice(0, 5);
			})
		]);

	const data: DashboardData = {
		stats: {
			totalPupils,
			activeLessons,
			pendingSubmissions,
			unreadMessages
		},
		recentActivity: recentActivity.map((activity) => ({
			...activity,
			time: formatTimeAgo(activity.time)
		}))
	};

	return data;
}) satisfies PageServerLoad;

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInDays > 0) {
		return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
	}
	if (diffInHours > 0) {
		return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
	}
	if (diffInMinutes > 0) {
		return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
	}
	return 'Just now';
}
