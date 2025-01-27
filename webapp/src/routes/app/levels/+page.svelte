<script lang="ts">
	import g10 from '$lib/img/g10.svg';
	import medalGold from '$lib/img/medail-gold.svg';
	import medalSilver from '$lib/img/medail-silver.svg';
	import medalBronze from '$lib/img/medail-bronze.svg';
	import { goto } from '$app/navigation';
	import { CircleAlert } from 'lucide-svelte';
	import { isMobileView } from '$lib/stores/viewport';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import * as m from '$lib/paraglide/messages.js';
	import type { ParentUser, Level, Pupil, Submission} from '../types';
	import { cn } from '$lib/components/coach/utils';


	interface GameLevel {
		id: number;
		status: 'locked' | 'current' | 'completed';
		medal: 'gold' | 'silver' | 'bronze' | null;
	}

	const { data } = $props<{
		data: {
			parentUser: ParentUser,
			levels: Level[]
		}
	}>();

	// map incoming data to existing model
	const selectedChild = $derived(
		data.parentUser.parent.pupils.find((pupil: Pupil) => pupil.id === $selectedChildIdStore) || data.parentUser.parent.pupils[0]
	);

	const gameLevels = $derived(() => {
		const levels: GameLevel[] = [];
		data.levels.forEach((level: Level) => {
			const currentLevel: number = level.levelNumber;
			const currentProgress: number = selectedChild.progress;
			let currentStatus: 'locked' | 'current' | 'completed';
			let currentMedal: 'gold' | 'silver' | 'bronze' | null = null;
			if (currentLevel <= currentProgress) {
				currentStatus = 'completed';
				const submission = selectedChild.submissions.find((sub: Submission) => sub.levelNumber === currentLevel);
				if (submission) {
					switch (submission.medal){
						case "GOLD":
							currentMedal = 'gold';
							break;
						case "SILVER":
							currentMedal = 'silver';
							break;
						case "BRONZE":
							currentMedal = 'bronze';
							break;
						default:
							break;
					}
				}
			} else if (currentLevel === currentProgress+1) {
				currentStatus = 'current';
			} else {
				currentStatus = 'locked';
			}

			levels.push({
				id: currentLevel,
				status: currentStatus,
				medal: currentMedal
			});
		});
		return levels;
	});

	const medalImages = {
		gold: medalGold,
		silver: medalSilver,
		bronze: medalBronze
	} as const;

	// Hardcoded positions for each level
	const levelPositions = [
		{ id: 7, x: 46, y: 90 },
		{ id: 6, x: 52, y: 72 },
		{ id: 5, x: 46, y: 59 },
		{ id: 4, x: 35, y: 46 },
		{ id: 3, x: 64, y: 33 },
		{ id: 2, x: 58, y: 20 },
		{ id: 1, x: 55, y: 7 }
	] as const;

	// Combine hardcoded positions with dynamic data
	const pageLevels = $derived(
		levelPositions.map((pos) => {
			const levelData = gameLevels().find((l: GameLevel) => l.id === pos.id) || {
				status: 'locked' as const,
				medal: null
			};
			return {
				...pos,
				...levelData
			};
		})
	);

	let showAlert = $state(false);
	let alertMessage = $state('');
	let alertPosition = $state({ x: 0, y: 0 });
	let clickedLevelId = $state<number | null>(null);

	$effect(() => {
		if (showAlert) {
			setTimeout(() => {
				showAlert = false;
				clickedLevelId = null;
			}, 5000);
		}
	});

	function handleLevelClick(level: (typeof pageLevels)[0], event: MouseEvent) {
		if (level.status === 'locked') {
			const nextLevel = pageLevels.find((l) => l.status === 'current');
			if (nextLevel) {
				const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
				const x = buttonRect.right + 20; // 20px offset from the button
				const y = buttonRect.top;

				alertMessage = `Complete level ${nextLevel.id} first to unlock this level.`;
				alertPosition = { x, y };
				clickedLevelId = level.id;
				showAlert = true;
			}
			return;
		}

		goto(`/app/levels/${level.id}`);
	}

	$isSidebarOpen = (false);
</script>

<div class="mb-[-3.5rem]">
	<div class="min-h-screen bg-background">
		<!-- <h1 class="pt-4 pb-6 text-4xl font-bold text-center text-foreground">Swimming Levels</h1> -->

		<div class="relative flex flex-col items-center justify-center w-full overflow-hidden mt-[-2.8vw]">
			<img src={g10} alt={m.level_background_alt()} class="object-contain w-full h-full" />
			<div class="absolute inset-0 w-full h-full">
				{#each pageLevels as level}
					<button
						class="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 focus:outline-none"
						style="left: {level.x}%; top: {level.y}%;"
						onclick={(e) => handleLevelClick(level, e)}
					>
						<div
							class="relative rounded-full flex items-center justify-center shadow-xl
							{level.status === 'completed'
								? 'bg-green-500 ring-4 ring-green-300'
								: level.status === 'current'
									? 'bg-blue-500 ring-4 ring-blue-300 animate-pulse'
									: 'bg-gray-400'}
							{level.status === 'locked' ? 'opacity-60' : 'opacity-100'}
							{$isMobileView ? 'w-[min(12vw,12rem)] h-[min(12vw,12rem)]' : 'w-[min(8vw,8rem)] h-[min(8vw,8rem)]'}"
						>
							<!-- <span
								class="text-white drop-shadow-md font-sniglet-regular fz-ms3 min-[320px]:fz-ms4 min-[425px]:font-sniglet-extrabold"> -->
							<span
								class="text-white drop-shadow-md font-sniglet-regular {$isMobileView
									? 'text-[min(5vw,1.75rem)]'
									: 'text-[min(3.5vw,2.25rem)]'}"
							>
								{level.id}
							</span>
							{#if level.medal && level.medal in medalImages}
								<img
									src={medalImages[level.medal as keyof typeof medalImages]}
									alt="Medal"
									class="absolute -top-[30%] -right-[30%] {$isMobileView
										? 'w-[min(9vw,9rem)] h-[min(9vw,9rem)]'
										: 'w-[min(6vw,6rem)] h-[min(6vw,6rem)]'}"
								/>
							{/if}
						</div>
					</button>

					{#if showAlert && clickedLevelId === level.id}
						<div
							class="absolute z-30 transition-opacity duration-300 animate-in fade-in-0 flex flex-grow-1"
							style={$isMobileView
								? cn("left: 50%; transform: translateX(-50%);", level.id === 7 ? `top: ${levelPositions[1].y + 3.5}%;` : `top: ${level.y + 3.5}%;`)
								: `left: 50%; transform: translateX(-50%); top: ${level.y + 3.5}%;`}
						>
							<div class={cn("p-1 flex flex-col flex-grow-1 gap-1 border rounded-lg shadow-lg bg-background/80 text-foreground",
								$isMobileView ? "" : "items-center gap-2"
							)}>
								<div class="flex items-center gap-2 font-medium text-primary">
									<CircleAlert class="w-4 h-4" />
									<span class="fz-ms2">Level Locked</span>
								</div>
								<p class={cn("fz-ms1 w-[min(66vw,16rem)] flex-grow-1 flex-shrink-0 text-muted-foreground",
									$isMobileView ? "" : "fz-ms2 w-[80vw] text-center"
								)}>
									{alertMessage}</p>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
