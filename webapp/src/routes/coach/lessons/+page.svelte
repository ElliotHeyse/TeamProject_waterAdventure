<script lang="ts">
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';
	import { Button } from '$lib/components/coach/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import { Input } from '$lib/components/coach/ui/input';
	import { Label } from '$lib/components/coach/ui/label';
	import { Textarea } from '$lib/components/coach/ui/textarea';

	let { data } = $props<{ data: PageData }>();
	let showNewLevelForm = $state(false);
	let newLevel = $state({
		title: '',
		description: '',
		duration: 45,
		levelNumber: 1
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold tracking-tight">{m.active_lessons()}</h2>
		<Button variant="outline" onclick={() => (showNewLevelForm = true)}>{m.create_level()}</Button>
	</div>

	{#if showNewLevelForm}
		<div class="rounded-lg border bg-card p-6">
			<h3 class="mb-4 text-lg font-semibold">{m.new_level()}</h3>
			<form class="space-y-4" method="POST" action="?/createLevel">
				<div class="space-y-2">
					<Label for="title">{m.title()}</Label>
					<Input
						type="text"
						id="title"
						name="title"
						bind:value={newLevel.title}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="description">{m.description()}</Label>
					<Textarea
						id="description"
						name="description"
						bind:value={newLevel.description}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="duration">{m.duration()}</Label>
					<Input
						type="number"
						id="duration"
						name="duration"
						bind:value={newLevel.duration}
						min="15"
						step="15"
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="levelNumber">{m.level_number()}</Label>
					<Input
						type="number"
						id="levelNumber"
						name="levelNumber"
						bind:value={newLevel.levelNumber}
						min="1"
						step="1"
						required
					/>
				</div>

				<div class="flex justify-end space-x-3">
					<Button
						variant="outline"
						onclick={() => (showNewLevelForm = false)}
					>
						{m.cancel()}
					</Button>
					<Button type="submit">
						{m.create()}
					</Button>
				</div>
			</form>
		</div>
	{/if}

	<DataTable levels={data.levels} />
</div>
