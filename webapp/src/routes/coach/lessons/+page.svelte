<script lang="ts">
	import { Level } from '@prisma/client';
	import type { PageData } from './$types';
	import type { NewLessonData } from '$lib/types/lessons';
	import DataTable from './data-table.svelte';
	import Button from '$lib/components/coach/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageData } = $props<{ data: PageData }>();
	let showNewLessonForm = $state(false);
	let newLesson: NewLessonData = {
		title: '',
		description: '',
		level: Level.BEGINNER,
		duration: 45,
		date: '',
		maxPupils: 10,
		order: 0
	};
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold tracking-tight">{m.active_lessons()}</h2>
		<!-- <Button variant="outline" onclick={() => (showNewLessonForm = true)}>{m.create_lesson()}</Button> -->
	</div>

	{#if showNewLessonForm}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold">{m.new_lesson()}</h3>
			<form class="space-y-4" method="POST" action="?/createLesson">
				<div>
					<label class="block text-sm font-medium text-gray-700" for="title">{m.title()}</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={newLesson.title}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="description"
						>{m.description()}</label
					>
					<textarea
						id="description"
						name="description"
						bind:value={newLesson.description}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						rows="3"
						required
					></textarea>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="level">{m.level()}</label>
					<select
						id="level"
						name="level"
						bind:value={newLesson.level}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					>
						<option value={Level.BEGINNER}>{m.beginner()}</option>
						<option value={Level.INTERMEDIATE}>{m.intermediate()}</option>
						<option value={Level.ADVANCED}>{m.advanced()}</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="duration"
						>{m.duration()}</label
					>
					<input
						type="number"
						id="duration"
						name="duration"
						bind:value={newLesson.duration}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						min="15"
						step="15"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="date">{m.date()}</label>
					<input
						type="date"
						id="date"
						name="date"
						bind:value={newLesson.date}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="order">{m.order()}</label>
					<input
						type="number"
						id="order"
						name="order"
						bind:value={newLesson.order}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						min="0"
						step="1"
						required
					/>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
						onclick={() => (showNewLessonForm = false)}
					>
						{m.cancel()}
					</button>
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						{m.create()}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<DataTable lessons={data.lessons} />
</div>
