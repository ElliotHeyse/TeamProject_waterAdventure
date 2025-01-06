<script lang="ts">
	interface Pupil {
		id: number;
		name: string;
		age: number;
		level: string;
		parent: string;
		contact: string;
	}

	interface NewPupil {
		name: string;
		age: string | number;
		level: string;
		parent: string;
		contact: string;
	}

	let pupils = $state<Pupil[]>([
		{
			id: 1,
			name: 'Alice Johnson',
			age: 10,
			level: 'Intermediate',
			parent: 'Sarah Johnson',
			contact: 'sarah.j@email.com'
		},
		{
			id: 2,
			name: 'Bob Smith',
			age: 8,
			level: 'Beginner',
			parent: 'Mike Smith',
			contact: 'mike.s@email.com'
		}
	]);

	let showNewPupilForm = $state(false);
	let newPupil = $state<NewPupil>({
		name: '',
		age: '',
		level: 'Beginner',
		parent: '',
		contact: ''
	});

	function createPupil(e: Event) {
		e.preventDefault();
		pupils = [
			...pupils,
			{
				id: pupils.length + 1,
				...newPupil,
				age: Number(newPupil.age)
			}
		];
		showNewPupilForm = false;
		newPupil = { name: '', age: '', level: 'Beginner', parent: '', contact: '' };
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
			<form class="space-y-4" onsubmit={createPupil}>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label class="block text-sm font-medium text-gray-700" for="name">Full Name</label>
						<input
							type="text"
							id="name"
							bind:value={newPupil.name}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700" for="age">Age</label>
						<input
							type="number"
							id="age"
							bind:value={newPupil.age}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							min="4"
							max="18"
							required
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700" for="level">Swimming Level</label
						>
						<select
							id="level"
							bind:value={newPupil.level}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option>Beginner</option>
							<option>Intermediate</option>
							<option>Advanced</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700" for="parent"
							>Parent/Guardian Name</label
						>
						<input
							type="text"
							id="parent"
							bind:value={newPupil.parent}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>

					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-700" for="contact"
							>Contact Email</label
						>
						<input
							type="email"
							id="contact"
							bind:value={newPupil.contact}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
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
							>Name</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>Age</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>Level</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>Parent/Guardian</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>Contact</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each pupils as pupil}
						<tr>
							<td class="whitespace-nowrap px-6 py-4">{pupil.name}</td>
							<td class="whitespace-nowrap px-6 py-4">{pupil.age}</td>
							<td class="whitespace-nowrap px-6 py-4">{pupil.level}</td>
							<td class="whitespace-nowrap px-6 py-4">{pupil.parent}</td>
							<td class="whitespace-nowrap px-6 py-4">{pupil.contact}</td>
							<td class="space-x-2 whitespace-nowrap px-6 py-4">
								<button class="text-blue-600 hover:text-blue-800">Edit</button>
								<button class="text-blue-600 hover:text-blue-800">View Progress</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
