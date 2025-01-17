<script lang="ts">
	import { enhance } from '$app/forms';
	import { Icon, CheckCircle } from 'svelte-hero-icons';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props<{ data: PageData }>();
	let videoUrl = $state('');
	let selectedLessonId = $state('');
	let message = $state<string | null>(null);
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
			message = m.video_submitted();
			videoUrl = '';
			selectedLessonId = '';
		} else {
			message = result.message || m.submission_failed();
		}
	}
</script>

<div class="px-4 py-4">
	<div class="mx-auto max-w-2xl space-y-8 p-4">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-gray-900">{m.submit_swimming_video()}</h1>
			<p class="mt-2 text-gray-600">
				{m.upload_greeting({ name: data.pupil.name })}
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
				<label for="lessonId" class="block text-sm font-medium text-gray-700"
					>{m.select_lesson()}</label
				>
				<select
					id="lessonId"
					name="lessonId"
					bind:value={selectedLessonId}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					required
				>
					<option value="">{m.choose_lesson()}</option>
					{#each data.lessons as lesson}
						<option value={lesson.id}
							>{lesson.title} - {new Date(lesson.date).toLocaleDateString()}</option
						>
					{/each}
				</select>
			</div>

			<div>
				<label for="videoUrl" class="block text-sm font-medium text-gray-700">{m.video_url()}</label>
				<input
					type="url"
					id="videoUrl"
					name="videoUrl"
					bind:value={videoUrl}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					placeholder={m.video_url_placeholder()}
					required
				/>
				<p class="mt-1 text-sm text-gray-500">
					{m.video_url_help()}
				</p>
			</div>

			<input type="hidden" name="pupilId" value={data.pupil.id} />

			<div class="flex justify-end">
				<button
					type="submit"
					class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
				>
					{m.submit_video()}
				</button>
			</div>
		</form>
	</div>
</div>
