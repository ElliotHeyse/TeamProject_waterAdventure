<script lang="ts">
	import g10 from "$lib/img/g10.svg";
	import medalGold from "$lib/img/medail-gold.svg";
	import medalSilver from "$lib/img/medail-silver.svg";
	import medalBronze from "$lib/img/medail-bronze.svg";

	const levels = [
		{ id: 7, x: 46, y: 90, status: 'locked' },
		{ id: 6, x: 52, y: 72, status: 'locked' },
		{ id: 5, x: 46, y: 59, status: 'locked' },
		{ id: 4, x: 35, y: 46, status: 'current' },
		{ id: 3, x: 64, y: 33, status: 'completed' },
		{ id: 2, x: 58, y: 20, status: 'completed', medal: medalSilver },
		{ id: 1, x: 55, y: 7, status: 'completed', medal: medalGold },
	];
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
								class="absolute -top-10 -right-10 w-[min(6vw,6rem)] h-[min(6vw,6rem)]"
							/>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>