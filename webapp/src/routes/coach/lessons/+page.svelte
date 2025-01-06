<script lang="ts">
	let lessons = $state([
		{ id: 1, title: 'Freestyle Basics', level: 'Beginner', duration: '45 min', date: '2024-01-10' },
		{
			id: 2,
			title: 'Advanced Backstroke',
			level: 'Advanced',
			duration: '60 min',
			date: '2024-01-12'
		}
	]);

	let showNewLessonForm = $state(false);
	let newLesson = $state({
		title: '',
		level: 'Beginner',
		duration: '45',
		date: ''
	});

	function createLesson(e: Event) {
		e.preventDefault();
		lessons = [...lessons, { id: lessons.length + 1, ...newLesson }];
		showNewLessonForm = false;
		newLesson = { title: '', level: 'Beginner', duration: '45', date: '' };
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900">Lessons</h2>
		<button
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
			onclick={() => (showNewLessonForm = true)}
		>
			Create Lesson
		</button>
	</div>

	{#if showNewLessonForm}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold">New Lesson</h3>
			<form class="space-y-4" onsubmit={createLesson}>
				<div>
					<label class="block text-sm font-medium text-gray-700" for="title">Title</label>
					<input
						type="text"
						id="title"
						bind:value={newLesson.title}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="level">Level</label>
					<select
						id="level"
						bind:value={newLesson.level}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					>
						<option>Beginner</option>
						<option>Intermediate</option>
						<option>Advanced</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="duration"
						>Duration (minutes)</label
					>
					<input
						type="number"
						id="duration"
						bind:value={newLesson.duration}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						min="15"
						step="15"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700" for="date">Date</label>
					<input
						type="date"
						id="date"
						bind:value={newLesson.date}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						required
					/>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
						onclick={() => (showNewLessonForm = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Create
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Title</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Level</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Duration</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Date</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 bg-white">
				{#each lessons as lesson}
					<tr>
						<td class="whitespace-nowrap px-6 py-4">{lesson.title}</td>
						<td class="whitespace-nowrap px-6 py-4">{lesson.level}</td>
						<td class="whitespace-nowrap px-6 py-4">{lesson.duration} min</td>
						<td class="whitespace-nowrap px-6 py-4">{lesson.date}</td>
						<td class="whitespace-nowrap px-6 py-4">
							<button class="text-blue-600 hover:text-blue-800">Edit</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
