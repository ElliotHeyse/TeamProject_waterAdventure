<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import * as m from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import type {ParentUser, Level, Exercise, Pupil, LevelProgress} from '../../types';
	import { TrendingUpDown } from 'lucide-svelte';

	const { data } = $props<{
		data: {
			parentUser: ParentUser;
			level: Level;
		};
	}>();

	const selectedChild = $derived(
		data.parentUser.parent.pupils.find((pupil: Pupil) => pupil.id === $selectedChildIdStore) || data.parentUser.parent.pupils[0]
	);

	// get exercises from the selected level
	let exercises = $state(data.level.exercises);

	// get level progress from the selected child on this level
	let levelProgress = $state(selectedChild.levelProgress[0]);

	let videoUrl = $state('');
	let message = $state<string | null>(null);
	let success = $state(false);

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			videoFile = input.files[0];
		}
	}

	async function toggleCompletion(exercise: Exercise) {
		if (exercises.length === 1) {
			// if there is only one exercise in the level,
			// toggle the completion of both completion states in sync
			levelProgress.firstPartCompleted = !levelProgress.firstPartCompleted;
			levelProgress.fullyCompleted = levelProgress.firstPartCompleted;
		} else if (exercises.length === 2) {
			// else if there are two exercises in the level
			if (exercise.exerciseNumber === 1) {
				// toggle the first part completion state if the first exercise is clicked
				levelProgress.firstPartCompleted = !levelProgress.firstPartCompleted;
			} else if (exercise.exerciseNumber === 2) {
				// toggle the fully completed state if the second exercise is clicked
				// the fully completed state serves as a secondPartCompletionstate,
				// only when both are true, the level will be marked as fully completed (in api)
				levelProgress.fullyCompleted = !levelProgress.fullyCompleted;
			}
		}
		const response = await fetch('/api/level-progress', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(
				{
					pupil: selectedChild,
					levelProgress: levelProgress
				}
			)
		});

		if (response.ok) {
			const result = await response.json();

			// Update the acive child's progress in the store
			selectedChild.progress = result.pupil.progress;
			selectedChild.levelProgress[0] = result.levelProgress;
			console.info("Level progress updated");
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
		formData.append('pupilId', selectedChild.id);
		formData.append('levelNumber', data.level.levelNumber);
		formData.append('videoUrl', videoUrl);

		const response = await fetch('/api/submission', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.success) {
			console.info("submission success");
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

	const isCompleted = $derived(levelProgress.fullyCompleted);
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6">
		<h1 class="text-3xl font-bold mb-4 text-foreground">Level {page.url.pathname.split('/').pop()} - {data.level.languageContents[0].title}
		</h1>
		<ul class="flex gap-4">
			{#each data.level.languageContents[0].objectives as objective}
			<li class="px-3 pt-1 pb-[6px] rounded-full bg-blue-200">
				<span class="text-blue-700">{objective}</span>
			</li>
			{/each}
		</ul>
	</div>

	{#each exercises as exercise}
		<div class="mb-12 bg-card rounded-lg p-6 shadow-md">
			<!-- header -->
			<div class="flex justify-between items-center mb-4">
				<div class="flex gap-8 items-end">
					<h3 class="text-2xl font-bold text-blue-950">{exercise.languageContents[0].title}</h3>
					<ul class="flex mb-[2px]">
						{#each exercise.languageContents[0].location as location}
							<li>
								<span class=" px-2 pb-[3px] pt-[2px] rounded bg-gray-200 text-muted-foreground">{location}</span>
							</li>
						{/each}
					</ul>
				</div>
				<button
					class="px-4 py-2 rounded-md {(exercise.exerciseNumber === 1 && levelProgress.firstPartCompleted) || (exercise.exerciseNumber === 2 && levelProgress.fullyCompleted)
						? 'bg-green-500 hover:bg-green-600'
						: 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors"
					onclick={() => toggleCompletion(exercise)}
				>
					{(exercise.exerciseNumber === 1 && levelProgress.firstPartCompleted) || (exercise.exerciseNumber === 2 && levelProgress.fullyCompleted) ? 'Voltooid' : 'Markeer als voltooid'}
				</button>
			</div>

			<!-- description(s) -->
			<div class="mb-6 text-blue-950 text-lg">
				{#if exercise.languageContents[0].description.length > 1}
					<ul class="flex flex-col gap-0 list-disc pl-4 space-y-2">
						{#each exercise.languageContents[0].description as description}
							<li>
								<span>{description}</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p>{exercise.languageContents[0].description[0]}</p>
				{/if}
			</div>

			<!-- importants note(s) -->
			{#if exercise.languageContents[0].important.length > 0}
				<div class="mb-6">
					<h4 class="text-lg font-semibold text-foreground">Important</h4>
					{#if exercise.languageContents[0].important.length > 1}
						<ul class="list-disc pl-4 space-y-2">
							{#each exercise.languageContents[0].important as note}
								<li class="text-foreground">{note}</li>
							{/each}
						</ul>
					{:else}
						<p class="text-foreground">{exercise.languageContents[0].important[0]}</p>
					{/if}
				</div>
			{/if}

			<!-- tip(s) -->
			{#if exercise.languageContents[0].tips.length > 0}
				<div class="mb-6">
					<h4 class="text-lg font-semibold text-foreground">Tips</h4>
					{#if exercise.languageContents[0].tips.length > 1}
						<ul class="list-disc pl-4 space-y-2">
							{#each exercise.languageContents[0].tips as tip}
								<li class="text-foreground">{tip}</li>
							{/each}
						</ul>
					{:else}
						<p class="text-foreground">{exercise.languageContents[0].tips[0]}</p>
					{/if}
				</div>
			{/if}

			<!-- video(s) -->
			<div class="mt-6 space-y-6">
				{#each exercise.videos as video}
					<div class="flex flex-col md:flex-row gap-6">
						<div class="w-full md:w-1/2">
							{#if data.parentUser.settings.language === 'nl'}
								<h5 class="text-lg font-semibold mb-2 text-foreground">{video.title[0]}</h5>
							{:else if data.parentUser.settings.language === 'en'}
								<h5 class="text-lg font-semibold mb-2 text-foreground">{video.title[1]}</h5>
							{:else if data.parentUser.settings.language === 'fr'}
								<h5 class="text-lg font-semibold mb-2 text-foreground">{video.title[2]}</h5>
							{/if}
							<video controls class="w-full rounded-lg border border-border">
								<source src={video.path} type="video/mp4" />
								Your browser does not support the video tag.
								<track kind="captions" />
							</video>
						</div>
						<span>{video.path}</span>
						<!-- video notes, skip for now -->
						<!-- <div class="w-full md:w-1/2 text-muted-foreground md:mt-10">
							{#if true}
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
						</div> -->
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if isCompleted}
		<div class="mt-8 bg-card rounded-lg p-6 shadow-md">
			{#if selectedChild.submissions[0]}
				<div class="space-y-4">
					<h2 class="text-2xl font-semibold">Jouw Inzending</h2>
					<div class="space-y-2">
						<p class="text-sm text-muted-foreground">Video URL:</p>
						<a href={selectedChild.submissions[0].videoUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-600 hover:underline">
							{selectedChild.submissions[0].videoUrl}
						</a>
						<p>{"<video player here>"}</p>
					</div>
				</div>
				{#if selectedChild.submissions[0].status === 'REVIEWED'}
					{#if selectedChild.submissions[0].feedback}
						<div class="mt-6 space-y-4 border-t pt-4">
							<div class="flex justify-between">
								<h3 class="text-lg font-semibold">Feedback van je coach</h3>
								<p class="text-sm text-muted-foreground">
									{
										(selectedChild.submissions[0].updatedAt).toLocaleDateString('nl-BE', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})
									}
								</p>
							</div>
							<div class="space-y-2">
								<p class="text-base">{selectedChild.submissions[0].feedback}</p>
								{#if selectedChild.submissions[0].medal !== 'NONE'}
									<div class="flex items-center gap-2 mt-2">
										<span class="text-sm font-medium">Medaille:</span>
										<span class="text-sm">
											{#if selectedChild.submissions[0].medal === 'GOLD'}
												🥇 Goud
											{:else if selectedChild.submissions[0].medal === 'SILVER'}
												🥈 Zilver
											{:else if selectedChild.submissions[0].medal === 'BRONZE'}
												🥉 Brons
											{/if}
										</span>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{:else}
					<div class="mt-6 space-y-4 border-t pt-4">
						<div class="flex justify-between">
							<h3 class="text-lg font-semibold">Nog geen feedback van je coach</h3>
						</div>
					</div>
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
				{#if message}
					<div
						class="mt-4 p-4 rounded-md {success
							? 'bg-green-100 text-green-700'
							: 'bg-red-100 text-red-700'}"
					>
						{message}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
