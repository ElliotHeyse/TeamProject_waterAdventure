<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import * as m from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';

	interface Exercise {
		id: string;
		part: string;
		name: string;
		title: string;
		description: string;
		completed: boolean;
		videos: {
			id: string;
			description: string;
			url: string;
			exerciseId: string;
			createdAt: Date;
			updatedAt: Date;
		}[];
	}

	interface LevelProgress {
		id: string;
		pupilId: string;
		lessonId: string;
		part: string;
		completed: boolean;
		completedAt: Date | null;
	}

	const { data } = $props<{
		data: {
			lesson: {
				id: string;
				title: string;
				objective: string;
				exercises: Exercise[];
			};
			progress: LevelProgress[];
			submissions: any[];
		};
	}>();

	let exercises = $state(data.lesson.exercises);
	let videoFile = $state<File | null>(null);
	let message = $state<string | null>(null);
	let success = $state(false);

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			videoFile = input.files[0];
		}
	}

	async function toggleCompletion(exercise: Exercise) {
		const response = await fetch('/api/level-progress', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				lessonId: data.lesson.id,
				part: exercise.part,
				completed: !exercise.completed
			})
		});

		if (response.ok) {
			const result = await response.json();
			// Update the exercise's completion status
			exercises = exercises.map((ex: Exercise) =>
				ex.part === exercise.part ? { ...ex, completed: result.completed } : ex
			);
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		success = false;
		message = '';

		if (!videoFile) {
			message = 'Please select a video file to upload';
			return;
		}

		const formData = new FormData();
		formData.append('lessonId', data.lesson.id);
		formData.append('video', videoFile);

		const response = await fetch('/api/submission', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.success) {
			success = true;
			message = m.video_submitted();
			videoFile = null;
			// After successful submission, redirect to levels page
			setTimeout(() => {
				goto('/app/levels');
			}, 1500);
		} else {
			message = result.message || m.submission_failed();
		}
	}

	const isCompleted = $derived(exercises.every((ex: Exercise) => ex.completed));
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-4 text-foreground">{data.lesson.title}</h1>
	<p class="text-xl mb-8 text-orange-500">{data.lesson.objective}</p>

	{#each exercises as exercise}
		<div class="mb-12 bg-card rounded-lg p-6 shadow-md">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-2xl font-semibold text-foreground">{exercise.title}</h3>
				<button
					class="px-4 py-2 rounded-md {exercise.completed
						? 'bg-green-500 hover:bg-green-600'
						: 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors"
					onclick={() => toggleCompletion(exercise)}
				>
					{exercise.completed ? 'Voltooid' : 'Markeer als voltooid'}
				</button>
			</div>

			<p class="text-muted-foreground mb-6">{exercise.description}</p>

			<div class="mt-6 space-y-6">
				{#each exercise.videos as video}
					<div class="flex flex-col md:flex-row gap-6">
						<div class="w-full md:w-1/2">
							<h5 class="text-lg font-semibold mb-2 text-foreground">{video.description}</h5>
							<video controls class="w-full rounded-lg border border-border">
								<source src={video.url} type="video/mp4" />
								Your browser does not support the video tag.
								<track kind="captions" />
							</video>
						</div>
						<div class="w-full md:w-1/2 text-muted-foreground md:mt-10">
							{#if video.description === 'Tokkelen op het water'}
								<ul class="list-disc pl-4 space-y-2">
									<li>Zittend op de trap met de handen golven maken</li>
									<li>Drijvend voorwaarts voortduwen</li>
									<li>Rustig in water stappen</li>
									<li>Handen in het water houden</li>
									<li>Vingers sturen</li>
									<li>Voorwerpen niet omstoten</li>
								</ul>
							{:else if video.description === 'Golven maken'}
								<ul class="list-disc pl-4 space-y-2">
									<li>Zittend op de trap met de benen</li>
									<li>Vriesvluchtige voorbij of omrijdende</li>
									<li>Gestrekte benen en voet-tenen</li>
									<li>Been-beweging zonder hulp</li>
									<li>Been-verplaatsing</li>
								</ul>
							{:else if video.description === 'Op het water slaan'}
								<ul class="list-disc pl-4 space-y-2">
									<li>Carwash</li>
									<li>Plezier door de voorwaarts lopen</li>
									<li>Met handen spelen op het water</li>
									<li>Achterwaarts, zijwaarts, springend... in de voorwaarts</li>
									<li>Een doorgang uitsluiten</li>
									<li>Ogen open houden</li>
									<li>Met vingers samengeknepen sturen</li>
								</ul>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if isCompleted}
		<div class="mt-8 bg-card rounded-lg p-6 shadow-md">
			{#if data.submission}
				{#if data.submission.status === 'REVIEWED'}
					<div class="space-y-4">
						<h2 class="text-2xl font-semibold">Jouw Inzending</h2>
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">Video:</p>
							<video controls class="w-full rounded-lg border border-border">
								<source src="/api/videos/{data.submission.videoUrl}" type="video/mp4" />
								Your browser does not support the video tag.
								<track kind="captions" />
							</video>
						</div>
						{#if data.submission.reviewInfo}
							<div class="mt-6 space-y-4 border-t pt-4">
								<h3 class="text-lg font-semibold">Feedback van je coach</h3>
								<div class="space-y-2">
									<p class="text-sm text-muted-foreground">
										Beoordeeld door {data.submission.reviewInfo.teacherName} op {new Date(
											data.submission.reviewInfo.reviewedAt
										).toLocaleDateString('nl-BE', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
									<p class="text-base">{data.submission.reviewInfo.feedback}</p>
									{#if data.submission.reviewInfo.medal !== 'NONE'}
										<div class="flex items-center gap-2 mt-2">
											<span class="text-sm font-medium">Medaille:</span>
											<span class="text-sm">
												{#if data.submission.reviewInfo.medal === 'GOLD'}
													🥇 Goud
												{:else if data.submission.reviewInfo.medal === 'SILVER'}
													🥈 Zilver
												{:else if data.submission.reviewInfo.medal === 'BRONZE'}
													🥉 Brons
												{/if}
											</span>
										</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<h2 class="text-2xl font-semibold mb-4">Video Inzending</h2>
					<form onsubmit={handleSubmit} class="space-y-4">
						<div>
							<label for="video" class="block text-sm font-medium text-gray-700"
								>Video Bestand</label
							>
							<input
								type="file"
								id="video"
								accept="video/*"
								onchange={handleFileChange}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
							/>
							<p class="mt-1 text-sm text-gray-500">
								Upload een video van je zwemles. Ondersteunde formaten: MP4, MOV, AVI.
							</p>
						</div>

						<div class="flex justify-end">
							<button
								type="submit"
								class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
							>
								Video Indienen
							</button>
						</div>
					</form>
				{/if}
			{:else}
				<h2 class="text-2xl font-semibold mb-4">Video Inzending</h2>
				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label for="video" class="block text-sm font-medium text-gray-700">Video Bestand</label>
						<input
							type="file"
							id="video"
							accept="video/*"
							onchange={handleFileChange}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
						<p class="mt-1 text-sm text-gray-500">
							Upload een video van je zwemles. Ondersteunde formaten: MP4, MOV, AVI.
						</p>
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Video Indienen
						</button>
					</div>
				</form>
			{/if}

			{#if message}
				<div
					class="mt-4 p-4 rounded-md {success
						? 'bg-green-100 text-green-700'
						: 'bg-red-100 text-red-700'}"
				>
					{message}
				</div>
			{/if}
		</div>
	{/if}
</div>
