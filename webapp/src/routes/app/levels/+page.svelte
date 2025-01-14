<script lang="ts">
	import g10 from "$lib/img/g10.svg";
	import medalGold from "$lib/img/medail-gold.svg";
	import medalSilver from "$lib/img/medial-silver.svg";
	import medalBronze from "$lib/img/medail-bronze.svg";

	const levels = [
		{ id: 7, x: 1350, y: 3900, status: 'locked' },
		{ id: 6, x: 1000, y: 3300, status: 'locked' },
		{ id: 5, x: 880, y: 2700, status: 'locked' },
		{ id: 4, x: 1150, y: 2100, status: 'current' },
		{ id: 3, x: 1750, y: 1500, status: 'completed' },
		{ id: 2, x: 1550, y: 900, status: 'completed' },
		{ id: 1, x: 1450, y: 300, status: 'completed' },
	];
</script>

<div class="min-h-screen bg-white">
	<h1 class="text-center text-4xl font-bold text-blue-600 pt-4 pb-6">Swimming Levels</h1>

	<div class="w-full overflow-hidden flex items-center justify-center">
		<img
			src={g10}
			alt="Level background"
			class="w-full h-full object-contain"
		/>
		
		<div class="absolute inset-0 w-full h-full">
			{#each levels as level}
				<button 
					class="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none"
					style="left: {level.x}px; top: {level.y}px;"
				>
					<div class="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg
						{level.status === 'completed' ? 'bg-green-500' : 
						level.status === 'current' ? 'bg-blue-500' : 
						'bg-gray-400'} 
						{level.status === 'locked' ? 'opacity-60' : 'opacity-100'}">
						<span class="text-white font-bold text-2xl">
							{level.id}
						</span>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>