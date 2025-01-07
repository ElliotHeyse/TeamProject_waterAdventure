<script lang="ts">
	import { CheckCircle, Icon } from 'svelte-hero-icons';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let videoUrl = $state('');
	let selectedLessonId = $state('');
	let message = $state('');
	let success = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		success = false;
		message = '';

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const response = await fetch('?/createSubmission', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.success) {
			success = true;
			message = 'Video submitted successfully!';
			videoUrl = '';
			selectedLessonId = '';
		} else {
			message = result.message || 'Failed to submit video';
		}
	}
</script>

<div class="mx-auto max-w-2xl space-y-8 p-4">
	<div class="text-center">
		<h1 class="text-2xl font-bold text-gray-900">Submit Your Swimming Video</h1>
		<p class="mt-2 text-gray-600">
			Hi {data.pupil.name}, upload a video of your swimming practice for review
		</p>
	</div>

	{#if message}
		<div
			class="rounded-md p-4"
			class:bg-green-50={success}
			class:text-green-800={success}
			class:bg-red-50={!success}
			class:text-red-800={!success}
		>
			<p class="flex items-center gap-2">
				{#if success}
					<Icon src={CheckCircle} class="h-5 w-5" />
				{/if}
				{message}
			</p>
		</div>
	{/if}

	<form class="space-y-6" method="POST" action="?/createSubmission" onsubmit={handleSubmit}>
		<div>
			<label for="lessonId" class="block text-sm font-medium text-gray-700">Select Lesson</label>
			<select
				id="lessonId"
				name="lessonId"
				bind:value={selectedLessonId}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				required
			>
				<option value="">Choose a lesson</option>
				{#each data.lessons as lesson}
					<option value={lesson.id}
						>{lesson.title} - {new Date(lesson.date).toLocaleDateString()}</option
					>
				{/each}
			</select>
		</div>

		<div>
			<label for="videoUrl" class="block text-sm font-medium text-gray-700">Video URL</label>
			<input
				type="url"
				id="videoUrl"
				name="videoUrl"
				bind:value={videoUrl}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="https://example.com/your-video"
				required
			/>
			<p class="mt-1 text-sm text-gray-500">
				Please upload your video to a video sharing platform and paste the URL here
			</p>
		</div>

		<input type="hidden" name="pupilId" value={data.pupil.id} />

		<div class="flex justify-end">
			<button
				type="submit"
				class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
			>
				Submit Video
			</button>
		</div>
	</form>
</div>
