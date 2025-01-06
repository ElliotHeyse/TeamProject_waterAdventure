<script lang="ts">
	import { Level } from '@prisma/client';
	import type { PageData } from './$types';
	import type { NewPupilData } from './types';

	let { data } = $props<{ data: PageData }>();
	let showNewPupilForm = $state(false);
	let newPupil = $state<NewPupilData>({
		name: '',
		dateOfBirth: '',
		level: Level.BEGINNER,
		parentId: '',
		notes: ''
	});

	function calculateAge(dateOfBirth: Date): number {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString();
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900">Pupils</h2>
		<button
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
			onclick={() => (showNewPupilForm = true)}
		>
			Add Pupil
		</button>
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

	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>
							Name
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>
							Age
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>
							Level
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>
							Parent/Guardian
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>
							Contact
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each data.pupils as pupil}
						<tr>
							<td class="whitespace-nowrap px-6 py-4">{pupil.name}</td>
							<td class="whitespace-nowrap px-6 py-4">{calculateAge(pupil.dateOfBirth)}</td>
							<td class="whitespace-nowrap px-6 py-4">{pupil.level}</td>
							<td class="whitespace-nowrap px-6 py-4">{pupil.parent.user.name}</td>
							<td class="whitespace-nowrap px-6 py-4">{pupil.parent.user.email}</td>
							<td class="space-x-2 whitespace-nowrap px-6 py-4">
								<button class="text-blue-600 hover:text-blue-800">Edit</button>
								<a
									href="/coach/pupils/{pupil.id}/progress"
									class="text-blue-600 hover:text-blue-800"
								>
									View Progress
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
