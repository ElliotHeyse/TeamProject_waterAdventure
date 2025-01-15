import { PrismaClient, UserRole, Level, SubmissionStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	// Clear existing data in the correct order
	await prisma.message.deleteMany();
	await prisma.review.deleteMany();
	await prisma.submission.deleteMany();
	await prisma.pupil.deleteMany();
	await prisma.coach.deleteMany();
	await prisma.parent.deleteMany();
	await prisma.user.deleteMany();
	await prisma.video.deleteMany();
	await prisma.exercise.deleteMany();
	await prisma.lesson.deleteMany();

	// Create coach user
	const coachUser = await prisma.user.create({
		data: {
			email: 'demo@demo.com',
			name: 'Sarah Johnson',
			password: await hash('demo', 10),
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

	// Create regular lessons
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

	const regularLessons = await Promise.all(
		lessonData.map((lesson, index) => {
			return prisma.lesson.create({
				data: {
					title: lesson.title,
					description: lesson.description,
					coachId: coachUser.coach!.id,
					duration: lesson.duration,
					level: lesson.level,
					date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
					isSwimmingLesson: false
				}
			});
		})
	);

	// Create swimming lessons (Oefening 1-7)
	const swimmingLessons = await Promise.all([
		// Oefening 1
		prisma.lesson.create({
			data: {
				title: "Oefening 1",
				description: "Angstreflexen in het water overwinnen; vertrouwen",
				objective: "Angstreflexen in het water overwinnen; vertrouwen",
				coachId: coachUser.coach!.id,
				duration: 45,
				level: Level.BEGINNER,
				date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
				isSwimmingLesson: true,
				order: 1,
				exercises: {
					create: [
						{
							part: "A",
							location: "thuis",
							name: "Sproeikampioen",
							description: "Sproei de tenen en voeten, knieën en benen rustig nat, daarna de buik en de rug, de handen, de schouders, de achterkant van het hoofd, de bovenkant van het hoofd en het gezicht.",
							important: "Moedig je kind aan om het hoofd onder de waterstraal te staan. Komt er toch water in de ogen? Laat je kind dan met de ogen knipperen om het water woor sneller uit te krijgen. Dat is beter dan wrijven.",
							tip: "Soms kan je de intensiteit van een sproeikop aanpassen. Een zachte straal werkt in het begin waarschijnlijk beter dan een harde straal. Daag je kind ook uit om langer onder de waterstraal te staan, bv. door luidop te tellen.",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/1AA_PG_2_OEF1A.mp4",
										description: "Sproeikampioen oefening"
									}
								]
							}
						},
						{
							part: "B",
							location: "zwembad",
							name: "Spitter, spetter, spat",
							description: "Zorg dat je kind het lichaam nat maakt met de armen. Laat je kind:\n- tokkelen op het water (zoals piano spelen)\n- golven maken (beweeg van links naar rechts)\n- met de handen op het water slaan\n- jou ook lekker nat spetteren.\n\nZorg dat je kind ook regelmatig van positie wisselt: zitten op de poep op de trapjes van het bad, met de knieën op de bodem of gewoon rechtstaan.",
							important: "Moedig je kind aan om het hoofd niet weg te draaien van de spetters en te knipperen als het water in de ogen krijgt.",
							tip: "Probeer eens een variant en laat je kind ook spetteren met de benen: > Zet je kind op de kant of op de trap van het bad > Laat het de benen op en neer in het water bewegen. Zorg dat de benen en voeten gestrekt zijn.",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/1BA_PG_7_OEF1B_WWles 1.mp4",
										description: "Tokkelen op het water"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/1BB_PG_20_OEF1BWWLES3.mp4",
										description: "Golven maken"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/1BC_LO_14_oef1B_LO LES2.mp4",
										description: "Op het water slaan"
									}
								]
							}
						}
					]
				}
			}
		}),

		// Oefening 2
		prisma.lesson.create({
			data: {
				title: "Oefening 2",
				description: "Aanvoelen remming en stuwing",
				objective: "Aanvoelen remming en stuwing",
				coachId: coachUser.coach!.id,
				duration: 45,
				level: Level.BEGINNER,
				date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
				isSwimmingLesson: true,
				order: 2,
				exercises: {
					create: [
						{
							part: "A",
							location: "thuis",
							name: "Waar zijn die handjes?",
							description: "> Laat je kind de armen en handen in het water bewegen in alle richtingen: duwen, zwaaien, draaien ... Zo duwt je kind het water weg terwijl het door het water stapt.\n> Daarna laat je je kind een drijvend voorwerp zoals een badeendje, een balletje ... vooruit duwen in het water zonder het aan te raken.",
							important: "Zorg dat je kind de vingers gesloten houdt. Zo kan het meer water wegduwen met de handen.",
							tip: "> Doe deze oefening voor en laat je kind het nadoen > Verzin zelf extra oefeningen en gebruik veel fantasie: handen wuiven onder water, armen bewegen als de wieken van een windmolen ...\n> Maak er een kleine competitie van: wie geraakt het snelst aan de overkant met het voorwerp?",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/2AA_PG_3_OEF2A_WWles1.mp4",
										description: "Waar zijn die handjes?"
									}
								]
							}
						},
						{
							part: "B",
							location: "zwembad",
							name: "Bestuur de trein",
							description: "> Laat je kind tot aan de heup of tot aan de borst in het water staan en een zwemplank vastnemen zoals een stuur.\n> Ga achter je kind staan als tweede wagon.\n> Rij nu samen als een trein door het zwembad met je kind als bestuurder.",
							important: "> Laat je kind het zwemplankje in verschillende posities leggen: op het water, dwars in het water, half of volledig onder water ...\n> Daarna kan het de plank ook in verschillende richtingen bewegen: van links naar rechts, van voor naar achter... Zo ervaart je kind dat sommige bewegingen in het water moeilijker zijn dan andere.",
							tip: "Een grote zwemplank kan je kind meer steun op het water geven, maar ook veel weerstand bieden als je ze recht houdt. Doe deze oefening ook eens met ander leuk spelmateriaal (bal, blokje, flexibeam,...)",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/2BA_PG_26_oef2b_WWles 5.mp4",
										description: "Bestuur de trein"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/2BB_WG_45_oef2B_wwles10.mp4",
										description: "Bestuur de trein variatie"
									}
								]
							}
						}
					]
				}
			}
		}),

		// Oefening 3
		prisma.lesson.create({
			data: {
				title: "Oefening 3",
				description: "Aquatisch ademen; vertrouwen; waterangst overwinnen",
				objective: "Aquatisch ademen; vertrouwen; waterangst overwinnen",
				coachId: coachUser.coach!.id,
				duration: 45,
				level: Level.BEGINNER,
				date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				isSwimmingLesson: true,
				order: 3,
				exercises: {
					create: [
						{
							part: "A",
							location: "thuis",
							name: "Bellenblazer",
							description: "> Je kind laat een beker vol lopen met water. Zorg ervoor dat het water ook over je kind heen loopt.\n> Laat het daarna met een rietje bellenblazen in de beker. Hoe harder het blaast, hoe groter de bellen.\n> Heb je geen beker? Dan kan je kind met een rietje gewoon ook bellen blazen in het water van het zwembad.",
							important: "Deze oefening lukt het best als je kind diep inademt. Zo kan het ook lang rustig uitblazen.",
							tip: "Doe deze opdracht mee met je kind. Wie blaast de grootste bellen of wie blaast het meeste water uit de beker?",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/3AA_PG_8_oef3A_WWles1.mp4",
										description: "Bellenblazer thuis"
									}
								]
							}
						},
						{
							part: "B",
							location: "zwembad",
							name: "Bellenblazen",
							description: "Laat je kind een licht balletje (bv. pingpongballetje) vooruit blazen. Dit kan vanuit verschillende posities in het bad:\n> op de knieën\n> rechtstaand\n> rondstappend",
							important: "Zorg ervoor dat je kind krachtig kan blazen. Zorg dat het hiervoor de lippen goed gebruikt, zoals in de afbeelding.",
							tip: "Motiveer je kind door zelf mee te doen en bedenk leuke spelletjes:\n> blaas het balletje naar elkaar\n> leg zo snel mogelijk een parcours af met het balletje",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/3BA_PG_11_oef3B_WWles2.mp4",
										description: "Bellenblazer zwembad"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/3BB_WG_12_OEF3B_WWles 1.mp4",
										description: "Bellenblazer variatie"
									}
								]
							}
						}
					]
				}
			}
		}),

		// Oefening 4
		prisma.lesson.create({
			data: {
				title: "Oefening 4",
				description: "Aquatisch ademen; verplaatsen in het water",
				objective: "Aquatisch ademen; verplaatsen in het water",
				coachId: coachUser.coach!.id,
				duration: 45,
				level: Level.BEGINNER,
				date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
				isSwimmingLesson: true,
				order: 4,
				exercises: {
					create: [
						{
							part: "A",
							location: "thuis",
							name: "Bellenblazer",
							description: "> Je kind laat een beker vol lopen met water. Zorg ervoor dat het water ook over je kind heen loopt.\n> Laat het daarna met een rietje bellenblazen in de beker. Hoe harder het blaast, hoe groter de bellen.\n> Heb je geen beker? Dan kan je kind met een rietje gewoon ook bellen blazen in het water van het zwembad.",
							important: "Deze oefening lukt het best als je kind diep inademt. Zo kan het ook lang rustig uitblazen.",
							tip: "Doe deze opdracht mee met je kind. Wie blaast de grootste bellen of wie blaast het meeste water uit de beker?",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/4AA_PG_13_oef4A_wwles3.mp4",
										description: "Bellenblazer oefening"
									}
								]
							}
						},
						{
							part: "B",
							location: "zwembad",
							name: "Onder het poortje door",
							description: "Maak met een voorwerp (flexibeam, plank, ballon...) of met je been of arm een 'poortje'. Laat je kind onder het poortje doorlopen.",
							important: "Zorg dat de mond van je kind toe is als het onder het poortje gaat. Variatie: laat je kind bellen blazen door neus en/of mond terwijl het onder het poortje loopt.",
							tip: "> Heeft je kind nog weinig vertrouwen in het water? Help het dan door het een hand te geven of een drijvend voorwerp te laten vasthouden.\n> Is je kind al een durver? Maak het poortje lager. Zo kan je kind ook de ogen openen terwijl het onder de poort stapt.\n> Variatie: laat je kind door jouw benen zwemmen of zelfs omkek",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/4BA_PG_14_oef4B_wwles2.mp4",
										description: "Onder het poortje door"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/4BB_WG_24_oef4A_wwles4.mp4",
										description: "Onder het poortje variatie 1"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/4BB_WG_27_oef4B_wwles6.mp4",
										description: "Onder het poortje variatie 2"
									}
								]
							}
						}
					]
				}
			}
		}),

		// Oefening 5
		prisma.lesson.create({
			data: {
				title: "Oefening 5",
				description: "Aquatisch ademen; wennen weerstand; verplaatsen in alle richtingen",
				objective: "Aquatisch ademen; wennen weerstand; verplaatsen in alle richtingen",
				coachId: coachUser.coach!.id,
				duration: 45,
				level: Level.BEGINNER,
				date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
				isSwimmingLesson: true,
				order: 5,
				exercises: {
					create: [
						{
							part: "A",
							location: "thuis en zwembad",
							name: "Duikexpert",
							description: "Laat je kind een gezonken voorwerp opduiken. Eerst gebruikt het de voeten en daarna de handen. Je kind kan rechtaan of zitten in het bad. Wissel ook af met verschillende dieptes: bv. eerst op de trede van de trapjes en daarna op de bodem.",
							important: "Zorg dat je kind de ogen openhoudt. Zie ook dat de mond gesloten is of dat het belletjes blaast.",
							tip: "> Als je kind bang is om onder water te gaan, doe dan gewoon mee.\n> Zorg voor meerdere voorwerpen om op te duiken.\n> Daag je kind verder uit als het goed gaat. Laat je kind:\n  > zo snel mogelijk drie schatten verzamelen\n  > eerst onder een obstakel (hoepel/ flexibeam/benen ...) door gaan voor je kind het voorwerp kan opduiken.",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/5AA_PG_15_oef5A_wwles3.mp4",
										description: "Duikexpert oefening"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/5AB_PG_16_oef5A_wwles3.mp4",
										description: "Duikexpert variatie"
									}
								]
							}
						}
					]
				}
			}
		}),

		// Oefening 6
		prisma.lesson.create({
			data: {
				title: "Oefening 6",
				description: "Rotaties lengte-as; rotatie breedte-as",
				objective: "Rotaties lengte-as; rotatie breedte-as",
				coachId: coachUser.coach!.id,
				duration: 45,
				level: Level.BEGINNER,
				date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
				isSwimmingLesson: true,
				order: 6,
				exercises: {
					create: [
						{
							part: "A",
							location: "zwembad",
							name: "Op de carrousel",
							description: "Laat je kind in het water springen met een halve draai (180°). Draai zowel links- als rechtsom. Laat het beginnen in het ondiepe water en ga daarna steeds een beetje dieper.",
							important: "Zorg dat je kind het lichaam recht houdt, zodat het in evenwicht kan landen. De armen van je kind ondersteunen hierbij de draaibeweging.",
							tip: "> Doe de oefening altijd eerst even voor.\n> Lukt dit al goed? Probeer dan ook eens een volledige draai (360°).\n> Is je kind een pro? Laat het dan de armen tijdens het draaien boven het hoofd uitstrekken!",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/6AA_PG_18_oef6A_wwles2.mp4",
										description: "Op de carrousel"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/6AB_WG_19_X_oef6A_wwles4.mp4",
										description: "Carrousel variatie 1"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/6AC_PG_36_Oef6A_WWles6.mp4",
										description: "Carrousel variatie 2"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/6AD_PG_37_Oef6A_WWles7.mp4",
										description: "Carrousel variatie 3"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/6AE_PG_35_oef6A_wwles4.mp4",
										description: "Carrousel variatie 4"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/6AF_WG_18_oef6A_WWles4.mp4",
										description: "Carrousel variatie 5"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/6AG_oefLO_01_oef6A_LO les6 v.mp4",
										description: "Carrousel variatie 6"
									}
								]
							}
						}
					]
				}
			}
		}),

		// Oefening 7
		prisma.lesson.create({
			data: {
				title: "Oefening 7",
				description: "Springen in het water",
				objective: "Springen in het water",
				coachId: coachUser.coach!.id,
				duration: 45,
				level: Level.BEGINNER,
				date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				isSwimmingLesson: true,
				order: 7,
				exercises: {
					create: [
						{
							part: "A",
							location: "zwembad",
							name: "Springkampioen",
							description: "Laat je kind vanaf de kant in het water springen in water tot aan de heup of borst.",
							important: "Zorg dat je kind met de tenen de zwembadrand vastgrijpt. Dit zorgt voor een verbeterde grip bij het afduwen.",
							tip: "Is je kind bang om in het water te springen? Je kan uiteraard helpen. Ga in het zwembad staan en ondersteun je kind tijdens de sprong door:\n> eerst twee handen vast te nemen\n> daarna een hand vast te nemen\n> te kijken naar een sprong zonder hulp",
							videos: {
								create: [
									{
										url: "/src/lib/beeldmateriaalZwemfed/7AA_PG_16_oef7A_wwles1.mp4",
										description: "Springkampioen oefening"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/7AB_WG_17_X_oef7A_WWles6.mp4",
										description: "Springkampioen variatie 1"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/7AC_WG_43_oef7A_wwles9.mp4",
										description: "Springkampioen variatie 2"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/7AD_LO_oef_7_LOles3_20.mp4",
										description: "Springkampioen variatie 3"
									}
								]
							}
						}
					]
				}
			}
		})
	]);

	// Create submissions for both regular and swimming lessons
	const allLessons = [...regularLessons, ...swimmingLessons];
	const submissions = await Promise.all(
		pupils.flatMap((pupil) =>
			allLessons.slice(0, 3).map((lesson) => {
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
