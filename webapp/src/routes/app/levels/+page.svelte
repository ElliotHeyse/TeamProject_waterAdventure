<script lang="ts">
	import g10 from "$lib/img/g10.svg";
	import medalGold from "$lib/img/medail-gold.svg";
	import medalSilver from "$lib/img/medail-silver.svg";
	import medalBronze from "$lib/img/medail-bronze.svg";
	import { goto } from "$app/navigation";
	import Alert from "$lib/components/coach/ui/alert/alert.svelte";
	import AlertTitle from "$lib/components/coach/ui/alert/alert-title.svelte";
	import AlertDescription from "$lib/components/coach/ui/alert/alert-description.svelte";
	import { CircleAlert } from "lucide-svelte";

	const levels = [
		{ id: 7, x: 46, y: 90, status: 'locked' },
		{ id: 6, x: 52, y: 72, status: 'locked' },
		{ id: 5, x: 46, y: 59, status: 'locked' },
		{ id: 4, x: 35, y: 46, status: 'current' },
		{ id: 3, x: 64, y: 33, status: 'completed' },
		{ id: 2, x: 58, y: 20, status: 'completed', medal: medalSilver },
		{ id: 1, x: 55, y: 7, status: 'completed', medal: medalGold },
	];

	let showAlert = $state(false);
	let alertMessage = $state('');
	let alertPosition = $state({ x: 0, y: 0 });
	let clickedLevelId = $state<number | null>(null);

	$effect(() => {
		if (showAlert) {
			setTimeout(() => {
				showAlert = false;
				clickedLevelId = null;
			}, 3000);
		}
	});

	function handleLevelClick(level: typeof levels[0], event: MouseEvent) {
		if (level.status === 'locked') {
			const nextLevel = levels.find(l => l.status === 'current');
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
</script>

<div class="min-h-screen bg-background">
	<h1 class="text-center text-4xl font-bold text-foreground pt-4 pb-6">Swimming Levels</h1>

	<div class="w-full overflow-hidden flex items-center justify-center relative">
		<img
			src={g10}
			alt="Level background"
			class="w-full h-full object-contain"
		/>
		<div class="absolute inset-0 w-full h-full">
			{#each levels as level}
				<button
					class="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 focus:outline-none"
					style="left: {level.x}%; top: {level.y}%;"
					onclick={(e) => handleLevelClick(level, e)}
				>
					<div class="relative w-[min(8vw,8rem)] h-[min(8vw,8rem)] rounded-full flex items-center justify-center shadow-xl
						{level.status === 'completed' ? 'bg-green-500 ring-4 ring-green-300' :
						level.status === 'current' ? 'bg-blue-500 ring-4 ring-blue-300 animate-pulse' :
						'bg-gray-400'}
						{level.status === 'locked' ? 'opacity-60' : 'opacity-100'}">
						<span class="text-white font-bold text-[min(2vw,2rem)] drop-shadow-md">
							{level.id}
						</span>
						{#if level.medal}
							<img
								src={level.medal}
								alt="Medal"
								class="absolute -top-[30%] -right-[30%] w-[min(6vw,6rem)] h-[min(6vw,6rem)]"
							/>
						{/if}
					</div>
				</button>

				{#if showAlert && clickedLevelId === level.id}
					<div
						class="absolute z-50 w-72 transition-opacity animate-in fade-in-0 duration-300"
						style="left: {level.x + 5}%; top: {level.y}%; transform: translateY(-50%);"
					>
						<div class="bg-background text-foreground rounded-lg border shadow-lg p-4 space-y-2">
							<div class="flex items-center gap-2 text-primary font-medium">
								<CircleAlert class="h-4 w-4" />
								<span>Level Locked</span>
							</div>
							<p class="text-sm text-muted-foreground">{alertMessage}</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>