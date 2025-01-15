import { PrismaClient, UserRole, Level, SubmissionStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	// Clear existing data in the correct order
	await prisma.message.deleteMany();
	await prisma.review.deleteMany();
	await prisma.submission.deleteMany();
	await prisma.video.deleteMany();
	await prisma.exercise.deleteMany();
	await prisma.lesson.deleteMany();
	await prisma.pupil.deleteMany();
	await prisma.coach.deleteMany();
	await prisma.parent.deleteMany();
	await prisma.user.deleteMany();

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
			parentEmail: 'mchen@example.com',
			notes: 'Strong freestyle technique, working on butterfly. Shows natural talent in sprints.'
		},
		{
			name: 'Lucas Chen',
			dob: new Date(2014, 3, 22),
			level: Level.BEGINNER,
			parentEmail: 'mchen@example.com',
			notes: 'New to swimming, making excellent progress in water confidence.'
		},
		{
			name: 'Isabella Rodriguez',
			dob: new Date(2013, 7, 8),
			level: Level.ADVANCED,
			parentEmail: 'erodriguez@example.com',
			notes: 'Competitive swimmer, specializing in backstroke. Preparing for regional championships.'
		}
	];

	const pupils = await Promise.all(
		pupilData.map(async (pupil) => {
			const parent = parents.find(p => p.email === pupil.parentEmail);
			if (!parent || !parent.parent) {
				throw new Error(`Parent not found for pupil ${pupil.name}`);
			}
			return prisma.pupil.create({
				data: {
					name: pupil.name,
					dateOfBirth: pupil.dob,
					level: pupil.level,
					parentId: parent.parent.id,
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson1_a_ex1_1.mp4",
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson1_b_ex1_2.mp4",
										description: "Tokkelen op het water"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson1_b_ex1_3.mp4",
										description: "Golven maken"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson1_c_ex1_1.mp4",
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson2_a_ex2_1.mp4",
										description: "Carwash oefening"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson2_b_ex2_1.mp4",
										description: "Voorwaarts lopen"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson2_b_ex2_2.mp4",
										description: "Achterwaarts lopen"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson3_a_ex3_1.mp4",
										description: "Bellen blazen"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson3_b_ex3_1.mp4",
										description: "Bellen blazen onder water"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson3_b_ex3_2.mp4",
										description: "Bellen blazen met neus"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson4_a_ex4_1.mp4",
										description: "Duiken naar voorwerp"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson4_b_ex4_1.mp4",
										description: "Duiken door hoepel"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson4_b_ex4_2.mp4",
										description: "Duiken naar bodem"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson5_a_ex5_1.mp4",
										description: "Drijven op buik"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson5_a_ex5_2.mp4",
										description: "Drijven op rug"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson6_a_ex6_1.mp4",
										description: "Voortbewegen op buik"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson6_b_ex6_1.mp4",
										description: "Voortbewegen met plank"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson6_c_ex6_1.mp4",
										description: "Voortbewegen met armen"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson6_d_ex6_1.mp4",
										description: "Voortbewegen met benen"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson6_e_ex6_1.mp4",
										description: "Voortbewegen combinatie"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson6_f_ex6_1.mp4",
										description: "Voortbewegen met hulp"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson6_g_ex6_1.mp4",
										description: "Voortbewegen zelfstandig"
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
										url: "/src/lib/beeldmateriaalZwemfed/lesson7_a_ex7_1.mp4",
										description: "Rugcrawl basis"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson7_b_ex7_1.mp4",
										description: "Rugcrawl armen"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson7_c_ex7_1.mp4",
										description: "Rugcrawl benen"
									},
									{
										url: "/src/lib/beeldmateriaalZwemfed/lesson7_d_ex7_1.mp4",
										description: "Rugcrawl combinatie"
									}
								]
							}
						}
					]
				}
			}
		})
	]);

	// Create example submissions and reviews for swimming lessons
	const submissionData = [
		// Sophie Chen - Completed first 3 levels with medals
		{
			pupilId: pupils[0].id,
			lessonId: swimmingLessons[0].id, // Level 1
			videoUrl: 'https://example.com/submission1.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Excellent progress in overcoming water anxiety. Perfect execution of all exercises.',
			rating: 10 // Gold medal
		},
		{
			pupilId: pupils[0].id,
			lessonId: swimmingLessons[1].id, // Level 2
			videoUrl: 'https://example.com/submission2.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Very good understanding of water resistance. Great arm positioning.',
			rating: 8 // Silver medal
		},
		{
			pupilId: pupils[0].id,
			lessonId: swimmingLessons[2].id, // Level 3
			videoUrl: 'https://example.com/submission3.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Good progress with aquatic breathing. Keep practicing the exercises.',
			rating: 6 // Bronze medal
		},
		{
			pupilId: pupils[0].id,
			lessonId: swimmingLessons[3].id, // Level 4
			videoUrl: 'https://example.com/submission4.mp4',
			status: SubmissionStatus.PENDING,
			feedback: null,
			rating: null
		},

		// Lucas Chen - Completed first level with gold medal, second level pending
		{
			pupilId: pupils[1].id,
			lessonId: swimmingLessons[0].id, // Level 1
			videoUrl: 'https://example.com/submission5.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Outstanding performance in water confidence exercises.',
			rating: 9 // Gold medal
		},
		{
			pupilId: pupils[1].id,
			lessonId: swimmingLessons[1].id, // Level 2
			videoUrl: 'https://example.com/submission6.mp4',
			status: SubmissionStatus.PENDING,
			feedback: null,
			rating: null
		},

		// Isabella Rodriguez - Completed first 4 levels with high scores
		{
			pupilId: pupils[2].id,
			lessonId: swimmingLessons[0].id, // Level 1
			videoUrl: 'https://example.com/submission7.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Perfect execution of all exercises. Natural talent in water.',
			rating: 10 // Gold medal
		},
		{
			pupilId: pupils[2].id,
			lessonId: swimmingLessons[1].id, // Level 2
			videoUrl: 'https://example.com/submission8.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Excellent control and understanding of water resistance.',
			rating: 9 // Gold medal
		},
		{
			pupilId: pupils[2].id,
			lessonId: swimmingLessons[2].id, // Level 3
			videoUrl: 'https://example.com/submission9.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Outstanding aquatic breathing control.',
			rating: 9 // Gold medal
		},
		{
			pupilId: pupils[2].id,
			lessonId: swimmingLessons[3].id, // Level 4
			videoUrl: 'https://example.com/submission10.mp4',
			status: SubmissionStatus.REVIEWED,
			feedback: 'Very good progress with advanced techniques.',
			rating: 8 // Silver medal
		},
		{
			pupilId: pupils[2].id,
			lessonId: swimmingLessons[4].id, // Level 5
			videoUrl: 'https://example.com/submission11.mp4',
			status: SubmissionStatus.PENDING,
			feedback: null,
			rating: null
		}
	];

	// Create submissions and their reviews
	await Promise.all(
		submissionData.map(async (submission) => {
			if (submission.status === SubmissionStatus.REVIEWED) {
				return prisma.submission.create({
					data: {
						pupilId: submission.pupilId,
						lessonId: submission.lessonId,
						videoUrl: submission.videoUrl,
						status: submission.status,
						feedback: submission.feedback,
						review: {
							create: {
								coachId: coachUser.coach!.id,
								rating: submission.rating!,
								comment: submission.feedback!
							}
						}
					}
				});
			} else {
				return prisma.submission.create({
					data: {
						pupilId: submission.pupilId,
						lessonId: submission.lessonId,
						videoUrl: submission.videoUrl,
						status: submission.status
					}
				});
			}
		})
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
