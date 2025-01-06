<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900">{data.pupil.name}'s Progress</h2>
		<a
			href="/coach/pupils"
			class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
		>
			Back to Pupils
		</a>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Recent Lessons -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold">Recent Lessons</h3>
			{#if data.lessons.length === 0}
				<p class="text-gray-500">No lessons recorded yet.</p>
			{:else}
				<div class="space-y-4">
					{#each data.lessons as lesson}
						<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
							<div class="flex justify-between">
								<span class="font-medium">{new Date(lesson.date).toLocaleDateString()}</span>
								<span class="rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800">
									{lesson.status}
								</span>
							</div>
							{#if lesson.notes}
								<p class="mt-2 text-sm text-gray-600">{lesson.notes}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Progress Overview -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold">Progress Overview</h3>
			<div class="space-y-4">
				<div>
					<span class="text-sm font-medium text-gray-500">Current Level</span>
					<p class="text-lg font-semibold">{data.pupil.level}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-gray-500">Total Lessons</span>
					<p class="text-lg font-semibold">{data.lessons.length}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-gray-500">Last Lesson</span>
					<p class="text-lg font-semibold">
						{data.lessons[0]
							? new Date(data.lessons[0].date).toLocaleDateString()
							: 'No lessons yet'}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
