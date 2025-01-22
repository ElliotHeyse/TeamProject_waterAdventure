import { PrismaClient, UserRole, SubmissionStatus, Medal, Theme, NotificationType} from '@prisma/client';
import { hash } from 'bcrypt';
import { getCompileCacheDir } from 'module';
import { title } from 'process';

const prisma = new PrismaClient();

async function main() {
	// Clear existing data in the correct order
	await prisma.notification.deleteMany();
	await prisma.message.deleteMany();
	await prisma.userSettings.deleteMany();
	await prisma.session.deleteMany();
	await prisma.submission.deleteMany();
	await prisma.levelProgress.deleteMany();
	await prisma.video.deleteMany();
	await prisma.exerciseLanguageContent.deleteMany();
	await prisma.exercise.deleteMany();
	await prisma.levelLanguageContent.deleteMany();
	await prisma.level.deleteMany();
	await prisma.pupil.deleteMany();
	await prisma.parent.deleteMany();
	await prisma.coach.deleteMany();
	await prisma.user.deleteMany();

	// Construct level data
	// TODO: level 3-7 volledig aanvullen
	const levelData = [
		{	// level 1
			duration: 20,
			levelNumber: 1,
			exercises: [
				{
					exerciseNumber: 1,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level1_ex1_1.mp4",
							title: [
								"Douchelied",
								"Shower song",
								"Chanson de douche"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"thuis"
							],
							title: "Sproeikampioen",
							description: [
								"Sproei de tenen en voeten, knieën en benen rustig nat, daarna de buik en de rug, de handen, de schouders, de achterkant van het hoofd, de bovenkant van het hoofd en het gezicht."
							],
							important: [
								"Moedig je kind aan om met het hoofd onder de waterstraal te staan. Komt er toch water in de ogen? Laat je kind dan met de ogen knipperen om het water wooer sneller uit te krijgen. Dat is beter dan wrijven."
							],
							tips: [
								"Soms kan je de intensiteit van een sproeikop aanpassen. Een zachte straal werkt in het begin waarschijnlijk beter dan een harde straal. Daag je kind ook uit om langer onder de waterstraal te staan, bv. door luidop te tellen."
							]
						},
						{
							language: "en",
							location: [
								"home"
							],
							title: "Spray Champion",
							description: [
								"Spray the toes and feet, knees and legs gently wet, then the belly and back, the hands, the shoulders, the back of the head, the top of the head, and the face."
							],
							important: [
								"Encourage your child to stand under the water stream with their head. If water gets into their eyes, have them blink to remove it more quickly. This is better than rubbing."
							],
							tips: [
								"Sometimes you can adjust the intensity of a spray nozzle. A gentle stream will probably work better at first than a strong one. Challenge your child to stay under the water stream longer, for example, by counting out loud."
							]
						},
						{
							language: "fr",
							location: [
								"maison"
							],
							title: "Champion de la Douche",
							description: [
								"Mouille doucement les orteils et les pieds, les genoux et les jambes, puis le ventre et le dos, les mains, les épaules, l'arrière de la tête, le sommet de la tête et le visage."
							],
							important: [
								"Encourage ton enfant à se tenir sous le jet d'eau avec la tête. Si de l'eau entre dans ses yeux, demande-lui de cligner des yeux pour l'éliminer plus rapidement. C'est mieux que de se frotter les yeux."
							],
							tips: [
								"Parfois, l'intensité d'une pomme de douche peut être ajustée. Un jet doux fonctionnera probablement mieux au début qu'un jet fort. Mets ton enfant au défi de rester plus longtemps sous le jet d'eau, par exemple en comptant à voix haute."
							]
						}
					]
				},
				{
					exerciseNumber: 2,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level1_ex2_1.mp4",
							title: [
								"Zittend op de trap piano spelen",
								"Sitting on the stairs playing the piano",
								"Assis sur les escaliers en train de jouer du piano"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level1_ex2_2.mp4",
							title: [
								"Zittend op trap met de benen kloppen",
								"Sitting on the stairs beating with the legs",
								"Assis sur les escaliers en battant avec les jambes"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level1_ex2_3.mp4",
							title: [
								"Carwash",
								"Carwash",
								"Carwash"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"zwembad"
							],
							title: "Spitter, spetter, spat",
							description: [
								"Zorg dat je kind het lichaam nat maakt met de armen. Laat je kind:",
								"Tokkelen op het water (zoals piano spelen)",
								"Golven maken (beweeg van links naar rechts)",
								"Met de handen op het water slaan",
								"Jou ook lekker nat spetteren",
								"Zorg dat je kind ook regelmatig van positie wisselt: zitten op de poep op de trapjes van het bad, met de knieën op de bodem of gewoon rechtstaan."
							],
							important: [
								"Moedig je kind aan om het hoofd niet weg te draaien van de spetters en te knipperen als het water in de ogen krijgt."
							],
							tips: [
								"Probeer eens een variant en laat je kind ook spetteren met de benen:",
								"Zet je kind op de kant of op de trap van het bad",
								"Laat het de benen op en neer in het water bewegen. Zorg dat de benen en voeten gestrekt zijn.",
								"Wissel af tussen traag en snel."
							]
						},
						{
							language: "en",
							location: [
								"swimming pool"
							],
							title: "Splash, Splatter, Splash",
							description: [
								"Make sure your child wets their body using their arms. Let your child:",
								"Tap on the water (like playing the piano)",
								"Create waves (move from left to right)",
								"Slap the water with their hands",
								"Splatter you with water too",
								"Make sure your child regularly changes position: sitting on their bottom on the pool steps, kneeling on the bottom, or just standing upright."
							],
							important: [
								"Encourage your child not to turn their head away from the splashes and to blink if water gets into their eyes."
							],
							tips: [
								"Try a variation and let your child splash with their legs:",
								"Sit your child on the edge or on the pool steps",
								"Let them move their legs up and down in the water. Ensure their legs and feet are stretched.",
								"Alternate between slow and fast movements."
							]
						},
						{
							language: "fr",
							location: [
								"piscine"
							],
							title: "Plouf, Plaf, Splash",
							description: [
								"Assure-toi que ton enfant mouille son corps avec ses bras. Laisse-le :",
								"Tapoter l'eau (comme jouer du piano)",
								"Faire des vagues (bouger de gauche à droite)",
								"Frapper l'eau avec les mains",
								"T'éclabousser aussi",
								"Assure-toi que ton enfant change régulièrement de position : assis sur les marches de la piscine, à genoux au fond ou simplement debout."
							],
							important: [
								"Encourage ton enfant à ne pas détourner la tête des éclaboussures et à cligner des yeux si l'eau entre dans ses yeux."
							],
							tips: [
								"Essaie une variante et laisse ton enfant éclabousser avec les jambes :",
								"Assieds ton enfant sur le bord ou sur les marches de la piscine",
								"Laisse-le bouger les jambes de haut en bas dans l'eau. Assure-toi que ses jambes et pieds sont tendus.",
								"Alterne entre lent et rapide."
							]
						}
					]
				}
			],
			languageContents: [
				{
					language: "nl",
					title: "Eerste kennismaking",
					objectives: [
						"angstreflexen in het water overwinnen",
						"vertrouwen"
					]
				},
				{
					language: "en",
					title: "First introduction",
					objectives: [
						"overcoming fear reflexes in the water",
						"confidence"
					]
				},
				{
					language: "fr",
					title: "Première introduction",
					objectives: [
						"surmonter les réflexes de peur dans l'eau",
						"confiance"
					]
				}
			]
		},
		{	// level 2
			duration: 20,
			levelNumber: 2,
			exercises: [
				{
					exerciseNumber: 1,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level2_ex1_1.mp4",
							title: [
								"Zittend op de trap golven maken",
								"Sitting on the stairs making waves",
								"Assis sur les escaliers en faisant des vagues"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"thuis"
							],
							title: "Waar zijn die handjes?",
							description: [
								"Laat je kind de armen en handen in het water bewegen in alle richtingen: duwen, zwaaien, draaien ... Zo duwt je kind het water weg terwijl het door het water stapt.",
								"Daarna laat je je kind een drijvend voorwerp zoals een badeendje, een balletje ... vooruit duwen in het water zonder het aan te raken."
							],
							important: [
								"Zorg dat je kind de vingers gesloten houdt. Zo kan het meer water wegduwen met de handen."
							],
							tips: [
								"Doe deze oefening voor en laat je kind het nadoen",
								"Verzin zelf extra oefeningen en gebruik veel fantasie: handen wuiven onder water, armen bewegen als de wieken van een windmolen ...",
								"Maak er een kleine competitie van: wie geraakt het snelst aan de overkant met het voorwerp?"
							]
						},
						{
							language: "en",
							location: [
								"home"
							],
							title: "Where Are Those Hands?",
							description: [
								"Let your child move their arms and hands in the water in all directions: pushing, waving, rotating... This way, your child pushes the water away while walking through it.",
								"Then, have your child push a floating object, such as a rubber duck or a small ball, forward in the water without touching it."
							],
							important: [
								"Make sure your child keeps their fingers closed. This allows them to push more water away with their hands."
							],
							tips: [
								"Demonstrate this exercise and let your child imitate it.",
								"Come up with additional exercises and use plenty of imagination: waving hands underwater, moving arms like the blades of a windmill...",
								"Turn it into a small competition: who can get the object to the other side the fastest?"
							]
						},
						{
							language: "fr",
							location: [
								"maison"
							],
							title: "Où sont ces petites mains ?",
							description: [
								"Laisse ton enfant bouger ses bras et ses mains dans l'eau dans toutes les directions : pousser, agiter, tourner... Ainsi, il repousse l'eau tout en marchant dedans.",
								"Ensuite, demande à ton enfant de pousser un objet flottant, comme un canard en plastique ou une petite balle, vers l'avant dans l'eau sans le toucher."
							],
							important: [
								"Assure-toi que ton enfant garde les doigts fermés. Cela lui permettra de repousser plus d'eau avec ses mains."
							],
							tips: [
								"Montre cet exercice et laisse ton enfant l'imiter.",
								"Invente d'autres exercices et fais preuve de beaucoup d'imagination : agiter les mains sous l'eau, bouger les bras comme les pales d'un moulin à vent...",
								"Transforme cela en une petite compétition : qui arrivera le plus vite de l'autre côté avec l'objet ?"
							]
						}
					]
				},
				{
					exerciseNumber: 2,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level2_ex2_1.mp4",
							title: [
								"Plankje dwars in het water bewegen",
								"Moving a board across the water",
								"Déplacer une planche à travers l'eau"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level2_ex2_2.mp4",
							title: [
								"Drijvend voorwerp wegstuwen",
								"Driving a floating object away",
								"Pousser un objet flottant"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"zwembad"
							],
							title: "Bestuur de trein",
							description: [
								"Laat je kind tot aan de heup of tot aan de borst in het water staan en een zwemplank vastnemen zoals een stuur.",
								"Ga achter je kind staan als tweede wagon.",
								"Rij nu samen als een trein door het zwembad met je kind als bestuurder."
							],
							important: [
								"Laat je kind het zwemplankje in verschillende posities leggen: op het water, dwars in het water, half of volledig onder water...",
								"Daarna kan het de plank ook in verschillende richtingen bewegen: van links naar rechts, van voor naar achter... Zo ervaart je kind dat sommige bewegingen in het water moeilijker zijn dan andere."
							],
							tips: [
								"Een grote zwemplank kan je kind meer steun op het water geven, maar ook veel weerstand bieden als je ze recht houdt.",
								"Doe deze oefening ook eens met ander leuk spelmateriaal (bal, blokje, flexibeam,...)"
							]
						},
						{
							language: "en",
							location: [
								"swimming pool"
							],
							title: "Drive the Train",
							description: [
								"Have your child stand in the water up to their hips or chest and hold a swim board like a steering wheel.",
								"Stand behind your child as the second wagon.",
								"Now ride together like a train through the pool with your child as the driver."
							],
							important: [
								"Let your child place the swim board in different positions: on the water, horizontally in the water, half or fully underwater...",
								"Then, they can move the board in different directions: left to right, forward to backward... This way, your child experiences that some movements in the water are harder than others."
							],
							tips: [
								"A large swim board can give your child more support in the water but can also provide more resistance if held upright.",
								"Try this exercise with other fun equipment (ball, block, flexibeam,...)"
							]
						},
						{
							language: "fr",
							location: [
								"piscine"
							],
							title: "Conduire le Train",
							description: [
								"Demande à ton enfant de se tenir dans l'eau jusqu'aux hanches ou à la poitrine et de tenir un planche de natation comme un volant.",
								"Tiens-toi derrière ton enfant comme le deuxième wagon.",
								"Maintenant, roulez ensemble comme un train à travers la piscine avec ton enfant comme conducteur."
							],
							important: [
								"Laisse ton enfant placer la planche de natation dans différentes positions : sur l'eau, à l'horizontale dans l'eau, à moitié ou complètement sous l'eau...",
								"Ensuite, il peut aussi déplacer la planche dans différentes directions : de gauche à droite, de l'avant vers l'arrière... Ainsi, ton enfant constate que certains mouvements dans l'eau sont plus difficiles que d'autres."
							],
							tips: [
								"Une grande planche de natation peut offrir plus de soutien à ton enfant dans l'eau, mais aussi beaucoup de résistance si elle est maintenue droite.",
								"Essaie cet exercice avec d'autres équipements amusants (balle, bloc, flexibeam,...)"
							]
						}
					]
				}
			],
			languageContents: [
				{
					language: "nl",
					title: "Drijfkracht",
					objectives: [
						"aanvoelen van remming en stuwing"
					]
				},
				{
					language: "en",
					title: "Buoyancy",
					objectives: [
						"perceiving resistance and propulsion"
					]
				},
				{
					language: "fr",
					title: "Flottabilité",
					objectives: [
						"ressentir la résistance et la propulsion"
					]
				}
			]
		},
		{	// level 3
			duration: 20,
			levelNumber: 3,
			exercises: [
				{
					exerciseNumber: 1,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level3_ex1_1.mp4",
							title: [
								"Bellenblazen",
								"Blowing bubbles",
								"Souffler des bulles"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"thuis"
							],
							title: "Bellenblazer",
							description: [
								"Je kind laat een beker vol lopen met water. Zorg ervoor dat het water ook over je kind heen loopt.",
								"Laat het daarna met een rietje bellenblazen in de beker. Hoe harder het blaast, hoe groter de bellen.",
								"Heb je geen beker? Dan kan je kind met een rietje gewoon ook bellen blazen in het water van het zwembad."
							],
							important: [
								"Deze oefening lukt het best als je kind diep inademt. Zo kan het ook lang rustig uitblazen."
							],
							tips: [
								"Doe deze opdracht mee met je kind. Wie blaast de grootste bellen of wie blaast het meeste water uit de beker?"
							]
						},
						{
							language: "en",
							location: [
								"home"
							],
							title: "Bubble Blower",
							description: [
								"Have your child fill a cup with water. Make sure the water flows over your child as well.",
								"Then let them blow bubbles in the cup with a straw. The harder they blow, the bigger the bubbles.",
								"Don't have a cup? Then your child can also blow bubbles in the pool water with a straw."
							],
							important: [
								"This exercise works best when your child takes a deep breath. This way, they can exhale calmly for a longer time."
							],
							tips: [
								"Do this exercise with your child. Who can blow the biggest bubbles or who can blow the most water out of the cup?"
							]
						},
						{
							language: "fr",
							location: [
								"maison"
							],
							title: "Souffleur de Bulles",
							description: [
								"Faites remplir un verre d'eau à votre enfant. Assurez-vous que l'eau coule aussi sur votre enfant.",
								"Ensuite, laissez-le souffler des bulles dans le verre avec une paille. Plus il souffle fort, plus les bulles sont grosses.",
								"Vous n'avez pas de verre ? Votre enfant peut aussi souffler des bulles dans l'eau de la piscine avec une paille."
							],
							important: [
								"Cet exercice fonctionne mieux lorsque votre enfant prend une profonde respiration. Ainsi, il peut expirer calmement plus longtemps."
							],
							tips: [
								"Faites cet exercice avec votre enfant. Qui peut souffler les plus grosses bulles ou qui peut souffler le plus d'eau hors du verre ?"
							]
						}
					]
				},
				{
					exerciseNumber: 2,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level3_ex2_1.mp4",
							title: [
								"Bellenblazen onder water",
								"Blowing bubbles underwater",
								"Souffler des bulles sous l'eau"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level3_ex2_2.mp4",
							title: [
								"Bellenblazen met neus",
								"Blowing bubbles with nose",
								"Souffler des bulles avec le nez"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"zwembad"
							],
							title: "Bellenblazen",
							description: [
								"Laat je kind een licht balletje (bv. pingpongballetje) vooruit blazen. Dit kan vanuit verschillende posities in het bad:",
								"op de knieën",
								"rechtstaand",
								"rondstappend"
							],
							important: [
								"Zorg ervoor dat je kind krachtig kan blazen. Zorg dat het hiervoor de lippen goed gebruikt, zoals in de afbeelding."
							],
							tips: [
								"Motiveer je kind door zelf mee te doen en bedenk leuke spelletjes:",
								"blaas het balletje naar elkaar",
								"leg zo snel mogelijk een parcours af met het balletje"
							]
						},
						{
							language: "en",
							location: [
								"swimming pool"
							],
							title: "Blowing Bubbles",
							description: [
								"Have your child blow a light ball (e.g., ping pong ball) forward. This can be done from different positions in the pool:",
								"on their knees",
								"standing up",
								"walking around"
							],
							important: [
								"Make sure your child can blow forcefully. Ensure they use their lips properly, as shown in the image."
							],
							tips: [
								"Motivate your child by participating and think of fun games:",
								"blow the ball to each other",
								"complete a course with the ball as quickly as possible"
							]
						},
						{
							language: "fr",
							location: [
								"piscine"
							],
							title: "Souffler des Bulles",
							description: [
								"Faites souffler à votre enfant une balle légère (par exemple, une balle de ping-pong) vers l'avant. Cela peut se faire depuis différentes positions dans la piscine :",
								"à genoux",
								"debout",
								"en marchant"
							],
							important: [
								"Assurez-vous que votre enfant puisse souffler avec force. Veillez à ce qu'il utilise correctement ses lèvres, comme montré sur l'image."
							],
							tips: [
								"Motivez votre enfant en participant et imaginez des jeux amusants :",
								"soufflez la balle l'un vers l'autre",
								"complétez un parcours avec la balle le plus rapidement possible"
							]
						}
					]
				}
			],
			languageContents: [
				{
					language: "nl",
					title: "Aquatisch ademen",
					objectives: [
						"aquatisch ademen",
						"vertrouwen",
						"waterangst overwinnen"
					]
				},
				{
					language: "en",
					title: "Aquatic Breathing",
					objectives: [
						"aquatic breathing",
						"confidence",
						"overcoming fear of water"
					]
				},
				{
					language: "fr",
					title: "Respiration Aquatique",
					objectives: [
						"respiration aquatique",
						"confiance",
						"surmonter la peur de l'eau"
					]
				}
			]
		},
		{	// level 4
			duration: 20,
			levelNumber: 4,
			exercises: [
				{
					exerciseNumber: 1,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level4_ex1_1.mp4",
							title: [
								"Duiken naar voorwerp",
								"Diving for object",
								"Plonger pour un objet"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"thuis"
							],
							title: "Bellenblazer",
							description: [
								"Je kind laat een beker vol lopen met water. Zorg ervoor dat het water ook over je kind heen loopt.",
								"Laat het daarna met een rietje bellenblazen in de beker. Hoe harder het blaast, hoe groter de bellen.",
								"Heb je geen beker? Dan kan je kind met een rietje gewoon ook bellen blazen in het water van het zwembad."
							],
							important: [
								"Deze oefening lukt het best als je kind diep inademt. Zo kan het ook lang rustig uitblazen."
							],
							tips: [
								"Doe deze opdracht mee met je kind. Wie blaast de grootste bellen of wie blaast het meeste water uit de beker?"
							]
						},
						{
							language: "en",
							location: [
								"home"
							],
							title: "Bubble Blower",
							description: [
								"Have your child fill a cup with water. Make sure the water flows over your child as well.",
								"Then let them blow bubbles in the cup with a straw. The harder they blow, the bigger the bubbles.",
								"Don't have a cup? Then your child can also blow bubbles in the pool water with a straw."
							],
							important: [
								"This exercise works best when your child takes a deep breath. This way, they can exhale calmly for a longer time."
							],
							tips: [
								"Do this exercise with your child. Who can blow the biggest bubbles or who can blow the most water out of the cup?"
							]
						},
						{
							language: "fr",
							location: [
								"maison"
							],
							title: "Souffleur de Bulles",
							description: [
								"Faites remplir un verre d'eau à votre enfant. Assurez-vous que l'eau coule aussi sur votre enfant.",
								"Ensuite, laissez-le souffler des bulles dans le verre avec une paille. Plus il souffle fort, plus les bulles sont grosses.",
								"Vous n'avez pas de verre ? Votre enfant peut aussi souffler des bulles dans l'eau de la piscine avec une paille."
							],
							important: [
								"Cet exercice fonctionne mieux lorsque votre enfant prend une profonde respiration. Ainsi, il peut expirer calmement plus longtemps."
							],
							tips: [
								"Faites cet exercice avec votre enfant. Qui peut souffler les plus grosses bulles ou qui peut souffler le plus d'eau hors du verre ?"
							]
						}
					]
				},
				{
					exerciseNumber: 2,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level4_ex2_1.mp4",
							title: [
								"Duiken door hoepel",
								"Diving through hoop",
								"Plonger à travers un cerceau"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level4_ex2_2.mp4",
							title: [
								"Duiken naar bodem",
								"Diving to bottom",
								"Plonger vers le fond"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"zwembad"
							],
							title: "Onder het poortje door",
							description: [
								"Maak met een voorwerp (flexibeam, plank, ballon...) of met je been of arm een 'poortje'. Laat je kind onder het poortje doorlopen."
							],
							important: [
								"Zorg dat de mond van je kind toe is als het onder het poortje gaat. Variatie: laat je kind bellen blazen door neus en/of mond terwijl het onder het poortje loopt."
							],
							tips: [
								"Heeft je kind nog weinig vertrouwen in het water? Help het dan door het een hand te geven of een drijvend voorwerp te laten vasthouden.",
								"Is je kind al een durver? Maak het poortje lager. Zo kan je kind ook de ogen openen terwijl het onder de poort stapt.",
								"Variatie: laat je kind door jouw benen zwemmen of zelfs omkeren"
							]
						},
						{
							language: "en",
							location: [
								"swimming pool"
							],
							title: "Under the Gateway",
							description: [
								"Create a 'gateway' with an object (flexibeam, board, balloon...) or with your leg or arm. Let your child walk under the gateway."
							],
							important: [
								"Make sure your child's mouth is closed when going under the gateway. Variation: let your child blow bubbles through nose and/or mouth while walking under the gateway."
							],
							tips: [
								"Does your child still have little confidence in the water? Help them by holding their hand or letting them hold a floating object.",
								"Is your child already daring? Make the gateway lower. This way your child can also open their eyes while stepping under the gateway.",
								"Variation: let your child swim through your legs or even turn around"
							]
						},
						{
							language: "fr",
							location: [
								"piscine"
							],
							title: "Sous la Porte",
							description: [
								"Créez une 'porte' avec un objet (flexibeam, planche, ballon...) ou avec votre jambe ou bras. Laissez votre enfant passer sous la porte."
							],
							important: [
								"Assurez-vous que la bouche de votre enfant est fermée lorsqu'il passe sous la porte. Variation : laissez votre enfant souffler des bulles par le nez et/ou la bouche en passant sous la porte."
							],
							tips: [
								"Votre enfant a-t-il encore peu confiance dans l'eau ? Aidez-le en lui tenant la main ou en le laissant tenir un objet flottant.",
								"Votre enfant est-il déjà audacieux ? Abaissez la porte. Ainsi, votre enfant peut aussi ouvrir les yeux en passant sous la porte.",
								"Variation : laissez votre enfant nager entre vos jambes ou même faire demi-tour"
							]
						}
					]
				}
			],
			languageContents: [
				{
					language: "nl",
					title: "Aquatisch ademen en verplaatsen",
					objectives: [
						"aquatisch ademen",
						"verplaatsen in het water"
					]
				},
				{
					language: "en",
					title: "Aquatic Breathing and Movement",
					objectives: [
						"aquatic breathing",
						"moving in water"
					]
				},
				{
					language: "fr",
					title: "Respiration Aquatique et Déplacement",
					objectives: [
						"respiration aquatique",
						"se déplacer dans l'eau"
					]
				}
			]
		},
		{	// level 5
			duration: 20,
			levelNumber: 5,
			exercises: [
				{
					exerciseNumber: 1,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level5_ex1_1.mp4",
							title: [
								"Bellenblazen",
								"Blowing bubbles",
								"Souffler des bulles"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"thuis"
							],
							title: "Bellenblazer",
							description: [
								"Je kind laat een beker vol lopen met water. Zorg ervoor dat het water ook over je kind heen loopt.",
								"Laat het daarna met een rietje bellenblazen in de beker. Hoe harder het blaast, hoe groter de bellen.",
								"Heb je geen beker? Dan kan je kind met een rietje gewoon ook bellen blazen in het water van het zwembad."
							],
							important: [
								"Deze oefening lukt het best als je kind diep inademt. Zo kan het ook lang rustig uitblazen."
							],
							tips: [
								"Doe deze opdracht mee met je kind. Wie blaast de grootste bellen of wie blaast het meeste water uit de beker?"
							]
						},
						{
							language: "en",
							location: [
								"home"
							],
							title: "Bubble Blower",
							description: [
								"Have your child fill a cup with water. Make sure the water flows over your child as well.",
								"Then let them blow bubbles in the cup with a straw. The harder they blow, the bigger the bubbles.",
								"Don't have a cup? Then your child can also blow bubbles in the pool water with a straw."
							],
							important: [
								"This exercise works best when your child takes a deep breath. This way, they can exhale calmly for a longer time."
							],
							tips: [
								"Do this exercise with your child. Who can blow the biggest bubbles or who can blow the most water out of the cup?"
							]
						},
						{
							language: "fr",
							location: [
								"maison"
							],
							title: "Souffleur de Bulles",
							description: [
								"Faites remplir un verre d'eau à votre enfant. Assurez-vous que l'eau coule aussi sur votre enfant.",
								"Ensuite, laissez-le souffler des bulles dans le verre avec une paille. Plus il souffle fort, plus les bulles sont grosses.",
								"Vous n'avez pas de verre ? Votre enfant peut aussi souffler des bulles dans l'eau de la piscine avec une paille."
							],
							important: [
								"Cet exercice fonctionne mieux lorsque votre enfant prend une profonde respiration. Ainsi, il peut expirer calmement plus longtemps."
							],
							tips: [
								"Faites cet exercice avec votre enfant. Qui peut souffler les plus grosses bulles ou qui peut souffler le plus d'eau hors du verre ?"
							]
						}
					]
				},
				{
					exerciseNumber: 2,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level5_ex2_1.mp4",
							title: [
								"Bellenblazen onder water",
								"Blowing bubbles underwater",
								"Souffler des bulles sous l'eau"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level5_ex2_2.mp4",
							title: [
								"Bellenblazen met neus",
								"Blowing bubbles with nose",
								"Souffler des bulles avec le nez"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"zwembad"
							],
							title: "Bellenblazen",
							description: [
								"Laat je kind een licht balletje (bv. pingpongballetje) vooruit blazen. Dit kan vanuit verschillende posities in het bad:",
								"op de knieën",
								"rechtstaand",
								"rondstappend"
							],
							important: [
								"Zorg ervoor dat je kind krachtig kan blazen. Zorg dat het hiervoor de lippen goed gebruikt, zoals in de afbeelding."
							],
							tips: [
								"Motiveer je kind door zelf mee te doen en bedenk leuke spelletjes:",
								"blaas het balletje naar elkaar",
								"leg zo snel mogelijk een parcours af met het balletje"
							]
						},
						{
							language: "en",
							location: [
								"swimming pool"
							],
							title: "Blowing Bubbles",
							description: [
								"Have your child blow a light ball (e.g., ping pong ball) forward. This can be done from different positions in the pool:",
								"on their knees",
								"standing up",
								"walking around"
							],
							important: [
								"Make sure your child can blow forcefully. Ensure they use their lips properly, as shown in the image."
							],
							tips: [
								"Motivate your child by participating and think of fun games:",
								"blow the ball to each other",
								"complete a course with the ball as quickly as possible"
							]
						},
						{
							language: "fr",
							location: [
								"piscine"
							],
							title: "Souffler des Bulles",
							description: [
								"Faites souffler à votre enfant une balle légère (par exemple, une balle de ping-pong) vers l'avant. Cela peut se faire depuis différentes positions dans la piscine :",
								"à genoux",
								"debout",
								"en marchant"
							],
							important: [
								"Assurez-vous que votre enfant puisse souffler avec force. Veillez à ce qu'il utilise correctement ses lèvres, comme montré sur l'image."
							],
							tips: [
								"Motivez votre enfant en participant et imaginez des jeux amusants :",
								"soufflez la balle l'un vers l'autre",
								"complétez un parcours avec la balle le plus rapidement possible"
							]
						}
					]
				}
			],
			languageContents: [
				{
					language: "nl",
					title: "Aquatisch ademen",
					objectives: [
						"aquatisch ademen",
						"vertrouwen",
						"waterangst overwinnen"
					]
				},
				{
					language: "en",
					title: "Aquatic Breathing",
					objectives: [
						"aquatic breathing",
						"confidence",
						"overcoming fear of water"
					]
				},
				{
					language: "fr",
					title: "Respiration Aquatique",
					objectives: [
						"respiration aquatique",
						"confiance",
						"surmonter la peur de l'eau"
					]
				}
			]
		},
		{	// level 6
			duration: 20,
			levelNumber: 6,
			exercises: [
				{
					exerciseNumber: 1,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level6_ex1_1.mp4",
							title: [
								"Bellenblazen",
								"Blowing bubbles",
								"Souffler des bulles"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"thuis"
							],
							title: "Bellenblazer",
							description: [
								"Je kind laat een beker vol lopen met water. Zorg ervoor dat het water ook over je kind heen loopt.",
								"Laat het daarna met een rietje bellenblazen in de beker. Hoe harder het blaast, hoe groter de bellen.",
								"Heb je geen beker? Dan kan je kind met een rietje gewoon ook bellen blazen in het water van het zwembad."
							],
							important: [
								"Deze oefening lukt het best als je kind diep inademt. Zo kan het ook lang rustig uitblazen."
							],
							tips: [
								"Doe deze opdracht mee met je kind. Wie blaast de grootste bellen of wie blaast het meeste water uit de beker?"
							]
						},
						{
							language: "en",
							location: [
								"home"
							],
							title: "Bubble Blower",
							description: [
								"Have your child fill a cup with water. Make sure the water flows over your child as well.",
								"Then let them blow bubbles in the cup with a straw. The harder they blow, the bigger the bubbles.",
								"Don't have a cup? Then your child can also blow bubbles in the pool water with a straw."
							],
							important: [
								"This exercise works best when your child takes a deep breath. This way, they can exhale calmly for a longer time."
							],
							tips: [
								"Do this exercise with your child. Who can blow the biggest bubbles or who can blow the most water out of the cup?"
							]
						},
						{
							language: "fr",
							location: [
								"maison"
							],
							title: "Souffleur de Bulles",
							description: [
								"Faites remplir un verre d'eau à votre enfant. Assurez-vous que l'eau coule aussi sur votre enfant.",
								"Ensuite, laissez-le souffler des bulles dans le verre avec une paille. Plus il souffle fort, plus les bulles sont grosses.",
								"Vous n'avez pas de verre ? Votre enfant peut aussi souffler des bulles dans l'eau de la piscine avec une paille."
							],
							important: [
								"Cet exercice fonctionne mieux lorsque votre enfant prend une profonde respiration. Ainsi, il peut expirer calmement plus longtemps."
							],
							tips: [
								"Faites cet exercice avec votre enfant. Qui peut souffler les plus grosses bulles ou qui peut souffler le plus d'eau hors du verre ?"
							]
						}
					]
				},
				{
					exerciseNumber: 2,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level6_ex2_1.mp4",
							title: [
								"Bellenblazen onder water",
								"Blowing bubbles underwater",
								"Souffler des bulles sous l'eau"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level6_ex2_2.mp4",
							title: [
								"Bellenblazen met neus",
								"Blowing bubbles with nose",
								"Souffler des bulles avec le nez"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"zwembad"
							],
							title: "Bellenblazen",
							description: [
								"Laat je kind een licht balletje (bv. pingpongballetje) vooruit blazen. Dit kan vanuit verschillende posities in het bad:",
								"op de knieën",
								"rechtstaand",
								"rondstappend"
							],
							important: [
								"Zorg ervoor dat je kind krachtig kan blazen. Zorg dat het hiervoor de lippen goed gebruikt, zoals in de afbeelding."
							],
							tips: [
								"Motiveer je kind door zelf mee te doen en bedenk leuke spelletjes:",
								"blaas het balletje naar elkaar",
								"leg zo snel mogelijk een parcours af met het balletje"
							]
						},
						{
							language: "en",
							location: [
								"swimming pool"
							],
							title: "Blowing Bubbles",
							description: [
								"Have your child blow a light ball (e.g., ping pong ball) forward. This can be done from different positions in the pool:",
								"on their knees",
								"standing up",
								"walking around"
							],
							important: [
								"Make sure your child can blow forcefully. Ensure they use their lips properly, as shown in the image."
							],
							tips: [
								"Motivate your child by participating and think of fun games:",
								"blow the ball to each other",
								"complete a course with the ball as quickly as possible"
							]
						},
						{
							language: "fr",
							location: [
								"piscine"
							],
							title: "Souffler des Bulles",
							description: [
								"Faites souffler à votre enfant une balle légère (par exemple, une balle de ping-pong) vers l'avant. Cela peut se faire depuis différentes positions dans la piscine :",
								"à genoux",
								"debout",
								"en marchant"
							],
							important: [
								"Assurez-vous que votre enfant puisse souffler avec force. Veillez à ce qu'il utilise correctement ses lèvres, comme montré sur l'image."
							],
							tips: [
								"Motivez votre enfant en participant et imaginez des jeux amusants :",
								"soufflez la balle l'un vers l'autre",
								"complétez un parcours avec la balle le plus rapidement possible"
							]
						}
					]
				}
			],
			languageContents: [
				{
					language: "nl",
					title: "Aquatisch ademen",
					objectives: [
						"aquatisch ademen",
						"vertrouwen",
						"waterangst overwinnen"
					]
				},
				{
					language: "en",
					title: "Aquatic Breathing",
					objectives: [
						"aquatic breathing",
						"confidence",
						"overcoming fear of water"
					]
				},
				{
					language: "fr",
					title: "Respiration Aquatique",
					objectives: [
						"respiration aquatique",
						"confiance",
						"surmonter la peur de l'eau"
					]
				}
			]
		},
		{	// level 7
			duration: 20,
			levelNumber: 7,
			exercises: [
				{
					exerciseNumber: 1,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level7_ex1_1.mp4",
							title: [
								"Bellenblazen",
								"Blowing bubbles",
								"Souffler des bulles"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"thuis"
							],
							title: "Bellenblazer",
							description: [
								"Je kind laat een beker vol lopen met water. Zorg ervoor dat het water ook over je kind heen loopt.",
								"Laat het daarna met een rietje bellenblazen in de beker. Hoe harder het blaast, hoe groter de bellen.",
								"Heb je geen beker? Dan kan je kind met een rietje gewoon ook bellen blazen in het water van het zwembad."
							],
							important: [
								"Deze oefening lukt het best als je kind diep inademt. Zo kan het ook lang rustig uitblazen."
							],
							tips: [
								"Doe deze opdracht mee met je kind. Wie blaast de grootste bellen of wie blaast het meeste water uit de beker?"
							]
						},
						{
							language: "en",
							location: [
								"home"
							],
							title: "Bubble Blower",
							description: [
								"Have your child fill a cup with water. Make sure the water flows over your child as well.",
								"Then let them blow bubbles in the cup with a straw. The harder they blow, the bigger the bubbles.",
								"Don't have a cup? Then your child can also blow bubbles in the pool water with a straw."
							],
							important: [
								"This exercise works best when your child takes a deep breath. This way, they can exhale calmly for a longer time."
							],
							tips: [
								"Do this exercise with your child. Who can blow the biggest bubbles or who can blow the most water out of the cup?"
							]
						},
						{
							language: "fr",
							location: [
								"maison"
							],
							title: "Souffleur de Bulles",
							description: [
								"Faites remplir un verre d'eau à votre enfant. Assurez-vous que l'eau coule aussi sur votre enfant.",
								"Ensuite, laissez-le souffler des bulles dans le verre avec une paille. Plus il souffle fort, plus les bulles sont grosses.",
								"Vous n'avez pas de verre ? Votre enfant peut aussi souffler des bulles dans l'eau de la piscine avec une paille."
							],
							important: [
								"Cet exercice fonctionne mieux lorsque votre enfant prend une profonde respiration. Ainsi, il peut expirer calmement plus longtemps."
							],
							tips: [
								"Faites cet exercice avec votre enfant. Qui peut souffler les plus grosses bulles ou qui peut souffler le plus d'eau hors du verre ?"
							]
						}
					]
				},
				{
					exerciseNumber: 2,
					videos: [
						{
							path: "/src/lib/beeldmateriaalZwemfed/level7_ex2_1.mp4",
							title: [
								"Bellenblazen onder water",
								"Blowing bubbles underwater",
								"Souffler des bulles sous l'eau"
							]
						},
						{
							path: "/src/lib/beeldmateriaalZwemfed/level7_ex2_2.mp4",
							title: [
								"Bellenblazen met neus",
								"Blowing bubbles with nose",
								"Souffler des bulles avec le nez"
							]
						}
					],
					languageContents: [
						{
							language: "nl",
							location: [
								"zwembad"
							],
							title: "Bellenblazen",
							description: [
								"Laat je kind een licht balletje (bv. pingpongballetje) vooruit blazen. Dit kan vanuit verschillende posities in het bad:",
								"op de knieën",
								"rechtstaand",
								"rondstappend"
							],
							important: [
								"Zorg ervoor dat je kind krachtig kan blazen. Zorg dat het hiervoor de lippen goed gebruikt, zoals in de afbeelding."
							],
							tips: [
								"Motiveer je kind door zelf mee te doen en bedenk leuke spelletjes:",
								"blaas het balletje naar elkaar",
								"leg zo snel mogelijk een parcours af met het balletje"
							]
						},
						{
							language: "en",
							location: [
								"swimming pool"
							],
							title: "Blowing Bubbles",
							description: [
								"Have your child blow a light ball (e.g., ping pong ball) forward. This can be done from different positions in the pool:",
								"on their knees",
								"standing up",
								"walking around"
							],
							important: [
								"Make sure your child can blow forcefully. Ensure they use their lips properly, as shown in the image."
							],
							tips: [
								"Motivate your child by participating and think of fun games:",
								"blow the ball to each other",
								"complete a course with the ball as quickly as possible"
							]
						},
						{
							language: "fr",
							location: [
								"piscine"
							],
							title: "Souffler des Bulles",
							description: [
								"Faites souffler à votre enfant une balle légère (par exemple, une balle de ping-pong) vers l'avant. Cela peut se faire depuis différentes positions dans la piscine :",
								"à genoux",
								"debout",
								"en marchant"
							],
							important: [
								"Assurez-vous que votre enfant puisse souffler avec force. Veillez à ce qu'il utilise correctement ses lèvres, comme montré sur l'image."
							],
							tips: [
								"Motivez votre enfant en participant et imaginez des jeux amusants :",
								"soufflez la balle l'un vers l'autre",
								"complétez un parcours avec la balle le plus rapidement possible"
							]
						}
					]
				}
			],
			languageContents: [
				{
					language: "nl",
					title: "Aquatisch ademen",
					objectives: [
						"aquatisch ademen",
						"vertrouwen",
						"waterangst overwinnen"
					]
				},
				{
					language: "en",
					title: "Aquatic Breathing",
					objectives: [
						"aquatic breathing",
						"confidence",
						"overcoming fear of water"
					]
				},
				{
					language: "fr",
					title: "Respiration Aquatique",
					objectives: [
						"respiration aquatique",
						"confiance",
						"surmonter la peur de l'eau"
					]
				}
			]
		}
	];

	// CREATE levels with linked: levelLanguageContents, exercises, exerciseLanguageContents and videos
	const levels = await Promise.all(
		levelData.map(async (level) => {
		  	return prisma.level.create({
				data: {
				  	duration: level.duration,
				  	levelNumber: level.levelNumber,
					exercises: {
						create: level.exercises.map((exercise) => ({
						  	exerciseNumber: exercise.exerciseNumber,
						  	videos: {
								create: exercise.videos.map((video) => ({
								  	path: video.path,
								  	title: video.title
								}))
						  	},
						  	languageContents: {
								create: exercise.languageContents.map((content) => ({
								  	language: content.language,
								  	location: content.location,
								  	title: content.title,
								  	description: content.description,
								  	important: content.important,
								  	tips: content.tips
								}))
						  	}
						}))
				  	},
				  	languageContents: {
						create: level.languageContents.map((content) => ({
						  	language: content.language,
						  	title: content.title,
						  	objectives: content.objectives
						}))
				  	}
				},
				include: {
				  	exercises: {
						include: {
						  videos: true,
						  languageContents: true
						}
				  	},
				  	languageContents: true
				}
		  	});
		})
	);

	// CREATE coach user with linked: coach, userSettings
	const coachUser = await prisma.user.create({
		data: {
			email: 'demo@demo.com',
			name: 'Zwemcoach Paco',
			password: await hash('demo', 10),
			role: UserRole.COACH,
			coach: {
				create: {
					bio: 'Zwemfed coach account, managed by Zemfed coaches.',
					specialties: [
						'Water Safety',
						'Beginner Swimming',
						'Water Confidence Building',
						'Parent-Child Swim Classes',
					]
				}
			},
			settings: {
				create: {
					language: 'nl'
				}
			}
		},
		include: {
			coach: true,
			settings: true
		}
	});

	// Construct parent data
	const parentData = [
		{
			name: 'Michael Chen',
			email: 'mchen@example.com',
			phone: '+15551234567',
			pupils: [
				{
					name: 'Sophie Chen',
					dateOfBirth: new Date(2018, 2, 13),
					progress: 6,
					notes: 'Born water baby, loves swimming and making great progress in all exercises.',
					levelProgress: [
						{
							levelNumber: 1,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 1)
						},
						{
							levelNumber: 2,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 2)
						},
						{
							levelNumber: 3,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 3)
						},
						{
							levelNumber: 4,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 4)
						},
						{
							levelNumber: 5,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 5)
						},
						{
							levelNumber: 6,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 6)
						},
						{
							levelNumber: 7,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						}
					],
					submissions: [
						{
							levelNumber: 1,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.GOLD
						},
						{
							levelNumber: 2,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.SILVER
						},
						{
							levelNumber: 3,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.BRONZE
						},
						{
							levelNumber: 4,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.GOLD
						},
						{
							levelNumber: 5,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.SILVER
						},
						{
							levelNumber: 6,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.PENDING,
							feedback: "Wauw!",
							medal: Medal.NONE
						}
					]
				},
				{
					name: 'Lucas Chen',
					dateOfBirth: new Date(2020, 3, 26),
					progress: 3,
					notes: 'Slow learner, but shows grit. Slowly overcoming water anxiety.',
					levelProgress: [
						{
							levelNumber: 1,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 1)
						},
						{
							levelNumber: 2,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 2)
						},
						{
							levelNumber: 3,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 3)
						},
						{
							levelNumber: 4,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 5,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 6,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 7,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						}
					],
					submissions: [
						{
							levelNumber: 1,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.GOLD
						},
						{
							levelNumber: 2,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.SILVER
						},
						{
							levelNumber: 3,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.PENDING,
							feedback: "Wauw!",
							medal: Medal.NONE
						}
					]
				}
			],
			notifications: [
				{
					timestamp: new Date(2025, 1, 1),
					isRead: true,
					type: NotificationType.META,
					title: 'Welkom bij Zwemfed!',
					body: 'Welkom bij het Eerste Wateravontuur!! Neem gerust een kijkje in de app, of ga meteen samen aan de slag met het eerste level.',
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 2),
					isRead: true,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 3),
					isRead: true,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Goed gedaan! Goed begonnen met het eerste level!',
					levelNumber: 1,
				},
				{
					timestamp: new Date(2025, 1, 4),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 5),
					isRead: false,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Goed bezig! Je maakt al goede vooruitgang!',
					levelNumber: 2,
				},
				{
					timestamp: new Date(2025, 1, 6),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 7),
					isRead: false,
					type: NotificationType.META,
					title: 'Gepland onderhoud',
					body: 'De app zal op 14 januari 2025 van 9:00 tot 12:00 uur UTC worden onderhouden. Onze excuses voor het ongemak.',
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 8),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 9),
					isRead: false,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Let op details. Houd je vingers goed gesloten bij het duwen van het water. Ga zo door!',
					levelNumber: 3,
				}
			]
		},
		{
			name: 'Emily Rodriguez',
			email: 'erodriguez@example.com',
			phone: '+15552345678',
			pupils: [
				{
					name: 'Isabella Rodriguez',
					dateOfBirth: new Date(2022, 10, 21),
					progress: 1,
					notes: 'New pupil.',
					levelProgress: [
						{
							levelNumber: 1,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 2,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 3,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 4,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 5,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 6,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 7,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						}
					],
					submissions: [
						{
							levelNumber: 1,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.PENDING,
							feedback: "Wauw!",
							medal: Medal.NONE
						}
					]
				},
				{
					name: 'Liam Rodriguez',
					dateOfBirth: new Date(2020, 8, 7),
					progress: 4,
					notes: 'Funny dude',
					levelProgress: [
						{
							levelNumber: 1,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 1)
						},
						{
							levelNumber: 2,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 2)
						},
						{
							levelNumber: 3,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 3)
						},
						{
							levelNumber: 4,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 4)
						},
						{
							levelNumber: 5,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 6,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 7,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						}
					],
					submissions: [
						{
							levelNumber: 1,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.GOLD
						},
						{
							levelNumber: 2,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.SILVER
						},
						{
							levelNumber: 3,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.BRONZE
						},
						{
							levelNumber: 4,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.PENDING,
							feedback: "Wauw!",
							medal: Medal.NONE
						}
					]
				}
			],
			notifications: [
				{
					timestamp: new Date(2025, 1, 1),
					isRead: true,
					type: NotificationType.META,
					title: 'Welkom bij Zwemfed!',
					body: 'Welkom bij het Eerste Wateravontuur!! Neem gerust een kijkje in de app, of ga meteen samen aan de slag met het eerste level.',
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 2),
					isRead: true,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 3),
					isRead: true,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Goed gedaan! Goed begonnen met het eerste level!',
					levelNumber: 1,
				},
				{
					timestamp: new Date(2025, 1, 4),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 5),
					isRead: false,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Goed bezig! Je maakt al goede vooruitgang!',
					levelNumber: 2,
				},
				{
					timestamp: new Date(2025, 1, 6),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 7),
					isRead: false,
					type: NotificationType.META,
					title: 'Gepland onderhoud',
					body: 'De app zal op 14 januari 2025 van 9:00 tot 12:00 uur UTC worden onderhouden. Onze excuses voor het ongemak.',
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 8),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 9),
					isRead: false,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Let op details. Houd je vingers goed gesloten bij het duwen van het water. Ga zo door!',
					levelNumber: 3,
				}
			]
		},
		{
			name: 'David Williams',
			email: 'dwilliams@example.com',
			phone: '+15553456789',
			pupils: [
				{
					name: 'Mia Williams',
					dateOfBirth: new Date(2022, 8, 7),
					progress: 4,
					notes: 'Nothing special to note.',
					levelProgress: [
						{
							levelNumber: 1,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 1)
						},
						{
							levelNumber: 2,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 2)
						},
						{
							levelNumber: 3,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 3)
						},
						{
							levelNumber: 4,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 4)
						},
						{
							levelNumber: 5,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 6,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 7,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						}
					],
					submissions: [
						{
							levelNumber: 1,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.GOLD
						},
						{
							levelNumber: 2,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.PENDING,
							feedback: "Wauw!",
							medal: Medal.NONE
						}
					]
				},
				{
					name: 'Ethan Williams',
					dateOfBirth: new Date(2020, 5, 18),
					progress: 2,
					notes: 'Slowly overcoming water anxiety.',
					levelProgress: [
						{
							levelNumber: 1,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 1)
						},
						{
							levelNumber: 2,
							firstPartCompleted: true,
							fullyCompleted: true,
							completedAt: new Date(2025, 1, 2)
						},
						{
							levelNumber: 3,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 4,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 5,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 6,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						},
						{
							levelNumber: 7,
							firstPartCompleted: false,
							fullyCompleted: false,
							completedAt: null
						}
					],
					submissions: [
						{
							levelNumber: 1,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.REVIEWED,
							feedback: "Wauw!",
							medal: Medal.GOLD
						},
						{
							levelNumber: 2,
							videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							status: SubmissionStatus.PENDING,
							feedback: "Wauw!",
							medal: Medal.NONE
						}
					]
				}
			],
			notifications: [
				{
					timestamp: new Date(2025, 1, 1),
					isRead: true,
					type: NotificationType.META,
					title: 'Welkom bij Zwemfed!',
					body: 'Welkom bij het Eerste Wateravontuur!! Neem gerust een kijkje in de app, of ga meteen samen aan de slag met het eerste level.',
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 2),
					isRead: true,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 3),
					isRead: true,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Goed gedaan! Goed begonnen met het eerste level!',
					levelNumber: 1,
				},
				{
					timestamp: new Date(2025, 1, 4),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 5),
					isRead: false,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Goed bezig! Je maakt al goede vooruitgang!',
					levelNumber: 2,
				},
				{
					timestamp: new Date(2025, 1, 6),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 7),
					isRead: false,
					type: NotificationType.META,
					title: 'Gepland onderhoud',
					body: 'De app zal op 14 januari 2025 van 9:00 tot 12:00 uur UTC worden onderhouden. Onze excuses voor het ongemak.',
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 8),
					isRead: false,
					type: NotificationType.MESSAGE,
					title: null,
					body: null,
					levelNumber: null,
				},
				{
					timestamp: new Date(2025, 1, 9),
					isRead: false,
					type: NotificationType.FEEDBACK,
					title: null,
					body: 'Let op details. Houd je vingers goed gesloten bij het duwen van het water. Ga zo door!',
					levelNumber: 3,
				}
			]
		}
	];

	// CREATE parent users with linked: parent, userSettings, notifications and pupils with linked: levelProgress and submissions
	const parentUsers = await Promise.all(
		parentData.map(async (parent) => {
			return prisma.user.create({
				data: {
					email: parent.email,
					name: parent.name,
					password: await hash('password123', 10),
					role: UserRole.PARENT,
					parent: {
					  	create: {
							phone: parent.phone,
							coachId: coachUser.coach!.id, // Link to existing coach
							pupils: {
								create: parent.pupils.map((pupil) => ({
								  	name: pupil.name,
								  	dateOfBirth: pupil.dateOfBirth,
								  	progress: pupil.progress,
								  	notes: pupil.notes,
								  	levelProgress: {
										create: pupil.levelProgress.map((levelProgress) => ({
											level: {
												connect: {
													levelNumber: levelProgress.levelNumber
												}
											},
											firstPartCompleted: levelProgress.firstPartCompleted,
											fullyCompleted: levelProgress.fullyCompleted,
											completedAt: levelProgress.completedAt
										}))
									},
									submissions: {
										create: pupil.submissions.map((submission) => ({
											level: {
												connect: {
													levelNumber: submission.levelNumber
												}
											},
											videoUrl: submission.videoUrl,
											status: submission.status,
											feedback: submission.feedback,
											medal: submission.medal
										}))
									}
								}))
						  	}
					  	}
					},
					settings: {
						create: {
							language: 'nl'
					  	}
					},
					notifications: {
						create: parent.notifications.map((notification) => ({
							timestamp: notification.timestamp,
							isRead: notification.isRead,
							type: notification.type,
							title: notification.title,
							body: notification.body,
							levelNumber: notification.levelNumber
						}))
					}
				},
			  	include: {
					parent: {
						include: {
							pupils: {
								include: {
									levelProgress: true,
									submissions: true
								}
							}
						}
					},
					settings: true,
					notifications: true
				}
			});
		})
	);

	// Construct message data
	interface SeedMessage {
		content: string;
		isRead: boolean;
		sender: UserRole;
		parentId: string;
	}

	let messageData: SeedMessage[] = [];

	await parentUsers.forEach((parentUser) => {
		// Construct message data per parent
		if (!parentUser.parent) return;
		const messageArray: SeedMessage[] = [
			{
				content: 'Welkom bij Zwemfed! Stel me gerust een vraag als je hulp of tips nodig hebt bij de oefeningen.',
				isRead: true,
				sender: UserRole.COACH,
				parentId: parentUser.parent.id
			},
			{
				content: `Hi, ik ben ${parentUser.name}. Ik heb een vraag over de oefeningen.`,
				isRead: true,
				sender: UserRole.PARENT,
				parentId: parentUser.parent.id
			},
			{
				content: `Hi ${parentUser.name}, zeker! Waarmee kan ik je helpen?`,
				isRead: true,
				sender: UserRole.COACH,
				parentId: parentUser.parent.id
			},
			{
				content: 'Ik vind de uitleg bij level 3, oefening 2 niet zo duidelijk. Kan je dit wat beter toelichten?',
				isRead: true,
				sender: UserRole.PARENT,
				parentId: parentUser.parent.id
			},
			{
				content: 'Is het de bedoeling dat ik mijn kind keihard het water in gooi en zo ver mogelijk laat stuiteren op het wateroppervlak?',
				isRead: true,
				sender: UserRole.PARENT,
				parentId: parentUser.parent.id
			},
			{
				content: 'LMAO no balls',
				isRead: true,
				sender: UserRole.COACH,
				parentId: parentUser.parent.id
			}
		];
		messageData = messageData.concat(messageArray);
	});

	// CREATE messages
	const messages = await Promise.all(
		messageData.map(async (message) => {
			return prisma.message.create({
				data: {
					content: message.content,
					isRead: message.isRead,
					sender: message.sender,
					parent: {
						connect: {
							id: message.parentId
						}
					},
					coach: {
						connect: {
							id: coachUser?.coach?.id
						}
					}
				}
			});
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
