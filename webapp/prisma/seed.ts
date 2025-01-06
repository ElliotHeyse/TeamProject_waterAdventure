import { PrismaClient, UserRole, Level, SubmissionStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	// Clear existing data
	await prisma.message.deleteMany();
	await prisma.review.deleteMany();
	await prisma.submission.deleteMany();
	await prisma.lessonPupil.deleteMany();
	await prisma.lesson.deleteMany();
	await prisma.pupil.deleteMany();
	await prisma.coach.deleteMany();
	await prisma.parent.deleteMany();
	await prisma.user.deleteMany();

	// Create coach user
	const coachUser = await prisma.user.create({
		data: {
			email: 'coach@example.com',
			name: 'Sarah Johnson',
			password: await hash('password123', 10),
			role: UserRole.COACH,
			coach: {
				create: {
					bio: 'Former national team swimmer with 12 years of coaching experience. Specialized in youth development and competitive swimming techniques. USA Swimming certified coach.',
					specialties: [
						'Competitive Swimming',
						'Youth Development',
						'Stroke Technique',
						'Race Strategy'
					]
				}
			}
		},
		include: {
			coach: true
		}
	});

	// Create parent users with realistic names
	const parentData = [
		{ name: 'Michael Chen', email: 'mchen@example.com', phone: '+15551234567' },
		{ name: 'Emily Rodriguez', email: 'erodriguez@example.com', phone: '+15552345678' },
		{ name: 'David Williams', email: 'dwilliams@example.com', phone: '+15553456789' },
		{ name: 'Maria Garcia', email: 'mgarcia@example.com', phone: '+15554567890' },
		{ name: 'James Wilson', email: 'jwilson@example.com', phone: '+15555678901' }
	];

	const parents = await Promise.all(
		parentData.map(async (parent) => {
			return prisma.user.create({
				data: {
					email: parent.email,
					name: parent.name,
					password: await hash('password123', 10),
					role: UserRole.PARENT,
					parent: {
						create: {
							phone: parent.phone
						}
					}
				},
				include: {
					parent: true
				}
			});
		})
	);

	// Create pupils with realistic data
	const pupilData = [
		{
			name: 'Sophie Chen',
			dob: new Date(2012, 5, 15),
			level: Level.INTERMEDIATE,
			notes: 'Strong freestyle technique, working on butterfly. Shows natural talent in sprints.'
		},
		{
			name: 'Lucas Chen',
			dob: new Date(2014, 3, 22),
			level: Level.BEGINNER,
			notes: 'New to swimming, making excellent progress in water confidence.'
		},
		{
			name: 'Isabella Rodriguez',
			dob: new Date(2013, 7, 8),
			level: Level.ADVANCED,
			notes:
				'Competitive swimmer, specializing in backstroke. Preparing for regional championships.'
		},
		{
			name: 'Emma Williams',
			dob: new Date(2011, 9, 30),
			level: Level.INTERMEDIATE,
			notes: 'Good all-around swimmer, particularly strong in breaststroke.'
		},
		{
			name: 'Carlos Garcia',
			dob: new Date(2013, 2, 12),
			level: Level.ADVANCED,
			notes: 'Excellent endurance, training for long-distance events.'
		},
		{
			name: 'Oliver Wilson',
			dob: new Date(2015, 1, 25),
			level: Level.BEGINNER,
			notes: 'Enthusiastic learner, working on basic stroke mechanics.'
		}
	];

	const pupils = await Promise.all(
		pupilData.map((pupil, index) => {
			return prisma.pupil.create({
				data: {
					name: pupil.name,
					dateOfBirth: pupil.dob,
					level: pupil.level,
					parentId: parents[Math.floor(index / 2)].parent!.id,
					coachId: coachUser.coach!.id,
					notes: pupil.notes
				}
			});
		})
	);

	// Create lessons with meaningful content
	const lessonData = [
		{
			title: 'Freestyle Technique Workshop',
			description: 'Focus on freestyle breathing patterns and arm recovery techniques',
			level: Level.INTERMEDIATE,
			duration: 60
		},
		{
			title: 'Beginner Water Confidence',
			description: 'Introduction to basic floating and breathing exercises for newcomers',
			level: Level.BEGINNER,
			duration: 45
		},
		{
			title: 'Advanced Race Preparation',
			description: 'Competition preparation including starts, turns, and race strategy',
			level: Level.ADVANCED,
			duration: 90
		},
		{
			title: 'Stroke Development',
			description: 'Refinement of all four competitive strokes with video analysis',
			level: Level.INTERMEDIATE,
			duration: 60
		},
		{
			title: 'Sprint Training Session',
			description: 'High-intensity workout focusing on speed and power development',
			level: Level.ADVANCED,
			duration: 75
		}
	];

	const lessons = await Promise.all(
		lessonData.map((lesson, index) => {
			return prisma.lesson.create({
				data: {
					title: lesson.title,
					description: lesson.description,
					coachId: coachUser.coach!.id,
					duration: lesson.duration,
					level: lesson.level,
					date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
				}
			});
		})
	);

	// Assign pupils to lessons
	await Promise.all(
		pupils.flatMap((pupil) =>
			lessons.slice(0, 3).map((lesson) => {
				return prisma.lessonPupil.create({
					data: {
						lessonId: lesson.id,
						pupilId: pupil.id,
						attended: Math.random() > 0.5
					}
				});
			})
		)
	);

	// Create submissions
	const submissions = await Promise.all(
		pupils.flatMap((pupil) =>
			lessons.slice(0, 2).map((lesson) => {
				return prisma.submission.create({
					data: {
						lessonId: lesson.id,
						pupilId: pupil.id,
						videoUrl: 'https://example.com/video.mp4',
						status: Math.random() > 0.5 ? SubmissionStatus.REVIEWED : SubmissionStatus.PENDING,
						feedback: Math.random() > 0.5 ? 'Good progress, keep practicing!' : null
					}
				});
			})
		)
	);

	// Create reviews for reviewed submissions
	await Promise.all(
		submissions
			.filter((s) => s.status === SubmissionStatus.REVIEWED)
			.map((submission) => {
				return prisma.review.create({
					data: {
						submissionId: submission.id,
						coachId: coachUser.coach!.id,
						rating: Math.floor(Math.random() * 5) + 1,
						comment: 'Great improvement in technique!'
					}
				});
			})
	);

	// Create messages
	await Promise.all(
		parents.flatMap((parent) =>
			Array.from({ length: 3 }).map((_, index) => {
				return prisma.message.create({
					data: {
						content: `Message ${index + 1} from parent to coach`,
						coachId: coachUser.coach!.id,
						parentId: parent.parent!.id,
						read: Math.random() > 0.5
					}
				});
			})
		)
	);

	console.log('Database seeded successfully!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
