<script lang="ts">
	import { Level } from '@prisma/client';
	import type { PageData } from './$types';
	import type { NewPupilData } from './types';
	import DataTable from './data-table.svelte';
	import Button from '$lib/components/coach/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props<{ data: PageData }>();
	let showNewPupilForm = $state(false);
	let newPupil = $state<NewPupilData>({
		name: '',
		dateOfBirth: '',
		level: Level.BEGINNER,
		parentId: '',
		notes: ''
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold tracking-tight">{m.pupils()}</h2>
		<Button variant="outline" onclick={() => (showNewPupilForm = true)}>{m.add_pupil()}</Button>
	</div>

	{#if showNewPupilForm}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold">New Pupil</h3>
			<form class="space-y-4" method="POST" action="?/createPupil">
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label class="block text-sm font-medium text-gray-700" for="name">Full Name</label>
						<input
							type="text"
							id="name"
							name="name"
							bind:value={newPupil.name}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700" for="dateOfBirth"
							>Date of Birth</label
						>
						<input
							type="date"
							id="dateOfBirth"
							name="dateOfBirth"
							bind:value={newPupil.dateOfBirth}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700" for="level">Swimming Level</label
						>
						<select
							id="level"
							name="level"
							bind:value={newPupil.level}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value={Level.BEGINNER}>Beginner</option>
							<option value={Level.INTERMEDIATE}>Intermediate</option>
							<option value={Level.ADVANCED}>Advanced</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700" for="parentId"
							>Parent/Guardian</label
						>
						<select
							id="parentId"
							name="parentId"
							bind:value={newPupil.parentId}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						>
							<option value="">Select a parent</option>
							{#each data.parents as parent}
								<option value={parent.id}>{parent.user.name}</option>
							{/each}
						</select>
					</div>

					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-700" for="notes">Notes</label>
						<textarea
							id="notes"
							name="notes"
							bind:value={newPupil.notes}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							rows="3"
						></textarea>
					</div>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
						onclick={() => (showNewPupilForm = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Add Pupil
					</button>
				</div>
			</form>
		</div>
	{/if}

	<DataTable pupils={data.pupils} />
</div>
