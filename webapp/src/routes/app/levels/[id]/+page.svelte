<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import { isMobileView } from '$lib/stores/viewport';
	import type { ParentUser, Level, Exercise, Pupil } from '../../types';
	import { cn } from '$lib/components/coach/utils';
	import { writable } from 'svelte/store';
	import { userSettings } from '$lib/stores/userSettings';

	const { data } = $props<{
		data: {
			parentUser: ParentUser;
			level: Level;
		};
	}>();

	const selectedChild = $derived(
		data.parentUser.parent.pupils.find((pupil: Pupil) => pupil.id === $selectedChildIdStore) ||
			data.parentUser.parent.pupils[0]
	);
	1;
	// get exercises from the selected level
	let exercises = $state(data.level.exercises);

	// get level progress from the selected child on this level
	let levelProgress = $state(selectedChild.levelProgress[0]);

	let message = $state<string | null>(null);
	let success = $state(false);
	let videoFile = $state<File | null>(null);
	let fileName = writable('No file chosen');

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			videoFile = input.files[0];
			$fileName = input.files[0].name;
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
			body: JSON.stringify({
				pupil: selectedChild,
				levelProgress: levelProgress
			})
		});

		if (response.ok) {
			const result = await response.json();

			// Update the acive child's progress in the store
			selectedChild.progress = result.pupil.progress;
			selectedChild.levelProgress[0] = result.levelProgress;
			console.info('Level progress updated');
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
		formData.append('video', videoFile);

		const response = await fetch('/api/submission', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.success) {
			console.info('submission success');
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

<div class={cn('h-full pb-14', $userSettings.theme === 'DARK' ? 'bg-background' : 'bg-blue-50')}>
	<div class="container mx-auto min-[1024px]:max-w-[1024px]">
		<!-- title -->
		<div class="pb-6 p-4 flex flex-col">
			<div class="flex flex-col">
				<span class="fz-ms2 min-[375px]:fz-ms3 text-muted-foreground"
					>Level {page.url.pathname.split('/').pop()}</span
				>
				<h1 class="fz-ms7 min-[375px]:fz-ms9 font-sniglet-regular mb-2 text-foreground">
					{data.level.languageContents[0].title}
				</h1>
			</div>
			<ul class="flex flex-wrap gap-x-2 gap-y-1 min-[375px]:gap-x-4">
				{#each data.level.languageContents[0].objectives as objective}
					<li
						class={cn(
							'px-2 py-[0.0625rem] rounded-full min-[375px]:px-3 min-[375px]:py-1 bg-blue-200',
							$userSettings.theme === 'DARK'
								? 'bg-blue-950 bg-opacity-100 text-blue-200'
								: 'bg-blue-200 text-blue-700'
						)}
					>
						<span class="fz-ms1 min-[375px]:fz-ms2">{objective}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- exercises -->
		{#each exercises as exercise}
			<div
				class={cn(
					'mb-6 p-4 shadow-md min-[425px]:rounded-lg min-[425px]:mx-4',
					$userSettings.theme === 'DARK' ? 'bg-blue-950 bg-opacity-50' : 'bg-card'
				)}
			>
				<!-- header -->
				<div class="flex justify-between gap-3 items-start mb-6">
					<div class="flex flex-col gap-1 items-start min-[577px]:gap-2">
						<h3
							class={cn(
								'fz-ms5 min-[375px]:fz-ms6 min-[577px]:fz-ms7 font-sniglet-extrabold',
								$userSettings.theme === 'DARK' ? 'text-foreground' : 'text-blue-950'
							)}
						>
							{exercise.languageContents[0].title}
						</h3>
						<ul class="flex flex-wrap gap-x-2 gap-y-1 min-[375px]:gap-x-3">
							{#each exercise.languageContents[0].location as location}
								<li
									class={cn(
										'px-1 rounded-md bg-opacity-75 min-[375px]:px-2 min-[375px]:py-[0.125rem]',
										$userSettings.theme === 'DARK'
											? 'bg-blue-950 bg-opacity-100 text-blue-100'
											: 'text-blue-700 bg-blue-100'
									)}
								>
									<span class="text-opacity-75 fz-ms1 min-[375px]:fz-ms2">{location}</span>
								</li>
							{/each}
						</ul>
					</div>
					<!-- Mark-as-done button -->
					<div class="flex flex-shrink-0 justify-end">
						<button
							class="rounded-md px-3 py-2 flex flex-col items-center {(exercise.exerciseNumber ===
								1 &&
								levelProgress.firstPartCompleted) ||
							(exercise.exerciseNumber === 2 && levelProgress.fullyCompleted)
								? `${$userSettings.theme === 'DARK' ? 'bg-green-700 hover:bg-green-800' : 'bg-green-500 hover:bg-green-600'}`
								: `${$userSettings.theme === 'DARK' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'}`}"
							onclick={() => toggleCompletion(exercise)}
						>
							{#if (exercise.exerciseNumber === 1 && levelProgress.firstPartCompleted) || (exercise.exerciseNumber === 2 && levelProgress.fullyCompleted)}
								<span class="fz-ms1 min-[320px]:fz-ms2 min-[375px]:fz-ms3 text-white"
									>{m.completed()}</span
								>
							{:else}
								<span class="fz-ms1 min-[320px]:fz-ms2 min-[375px]:fz-ms3 text-white"
									>{m.mark_as_completed()}</span
								>
							{/if}
						</button>
					</div>
				</div>

				<!-- exercise content -->
				<div class="flex flex-col gap-6">
					<!-- description(s) -->
					<div
						class={cn(
							'font-medium fz-ms1 min-[375px]:fz-ms2 min-[768px]:fz-ms3',
							$userSettings.theme === 'DARK' ? 'text-foreground' : 'text-blue-950'
						)}
					>
						{#if exercise.languageContents[0].description.length > 1}
							<!-- test on level 2 -->
							<ul class="flex flex-col gap-2 list-disc pl-4">
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

					<!-- important note(s) -->
					{#if exercise.languageContents[0].important.length > 0}
						<div class="flex flex-col gap-1">
							<h4
								class="font-sniglet-regular text-foreground fz-ms4 min-[375px]:fz-ms5 min-[425px]:fz-ms6"
							>
								{m.important_section()}
							</h4>
							{#if exercise.languageContents[0].important.length > 1}
								<!-- test on level 2 -->
								<ul class="space-y-2">
									{#each exercise.languageContents[0].important as note}
										<li class="text-foreground fz-ms1 min-[375px]:fz-ms2">{note}</li>
									{/each}
								</ul>
							{:else}
								<p class="text-foreground fz-ms1 min-[375px]:fz-ms2">
									{exercise.languageContents[0].important[0]}
								</p>
							{/if}
						</div>
					{/if}

					<!-- tips -->
					{#if exercise.languageContents[0].tips.length > 0}
						<div class="flex flex-col gap-1">
							<h4
								class="font-sniglet-regular text-foreground fz-ms4 min-[375px]:fz-ms5 min-[425px]:fz-ms6"
							>
								{m.tips_section()}
							</h4>
							{#if exercise.languageContents[0].tips.length > 1}
								<!-- test on level 2 -->
								<ul class="flex flex-col gap-2 list-disc pl-4">
									{#each exercise.languageContents[0].tips as note}
										<li class="fz-ms1 text-foreground min-[375px]:fz-ms2">{note}</li>
									{/each}
								</ul>
							{:else}
								<!-- test on level 1 -->
								<p class="fz-ms1 text-foreground min-[375px]:fz-ms2">
									{exercise.languageContents[0].tips[0]}
								</p>
							{/if}
						</div>
					{/if}

					<!-- videos -->
					{#if exercise.videos.length > 0}
						<div class="flex flex-col gap-2">
							<h4
								class="fz-ms4 font-sniglet-regular text-foreground min-[375px]:fz-ms5 min-[425px]:fz-ms6"
							>
								{m.example_videos()}
							</h4>
							<div
								class="flex flex-col gap-3 min-[425px]:gap-6
								{exercise.videos.length > 1
									? 'min-[768px]:grid min-[768px]:grid-cols-2 min-[768px]:gap-3'
									: 'min-[768px]:w-[min(100%,29.625rem)]'}"
							>
								{#each exercise.videos as video}
									<div class="flex flex-col gap-1">
										<h5
											class="fz-ms2 font-sniglet-regular text-[#F3474F] min-[375px]:fz-ms3 min-[425px]:fz-ms4
											{exercise.videos.length > 1 ? 'min-[768px]:fz-ms3 min-[1024px]:fz-ms5' : 'min-[768px]:fz-ms5'}"
										>
											{#if data.parentUser.settings.language === 'nl'}
												{video.title[0]}
											{:else if data.parentUser.settings.language === 'en'}
												{video.title[1]}
											{:else if data.parentUser.settings.language === 'fr'}
												{video.title[2]}
											{/if}
										</h5>
										<video controls class="w-full rounded-lg border border-border">
											<source src={video.path} type="video/mp4" />
											{m.video_not_supported()}
											<track kind="captions" />
										</video>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}

		{#if isCompleted}
			{#if selectedChild.submissions[0]}
				<div
					class={cn(
						'mb-6 p-4 shadow-md min-[420px]:rounded-lg min-[425px]:mx-4',
						$userSettings.theme === 'DARK' ? 'bg-blue-950 bg-opacity-50' : 'bg-card'
					)}
				>
					<div class="flex flex-col gap-4">
						<h3
							class={cn(
								'fz-ms5 min-[375px]:fz-ms6 min-[577px]:fz-ms7 font-sniglet-extrabold',
								$userSettings.theme === 'DARK' ? 'text-foreground' : 'text-blue-950'
							)}
						>
							{m.my_submission()}
						</h3>
						<div>
							<div class="flex flex-col gap-2">
								<video controls class="w-full rounded-lg border border-border mb-2">
									<source src={selectedChild.submissions[0].videoUrl} type="video/mp4" />
									Your browser does not support the video tag.
									<track kind="captions" />
								</video>
								<hr />
								{#if selectedChild.submissions[0].status === 'REVIEWED'}
									<div class="flex flex-col gap-1 min-[320px]:gap-2">
										<div class="flex justify-between items-center">
											<h4
												id="feedback"
												class="fz-ms4 font-sniglet-regular text-foreground min-[375px]:fz-ms5 min-[425px]:fz-ms6"
											>
												{m.coach_feedback()}
											</h4>
											<span
												class={cn(
													'px-1 py-[0.0625rem] rounded fz-ms1 text-right text-muted-foreground',
													$userSettings.theme === 'DARK' ? 'bg-gray-950' : 'bg-gray-200'
												)}
											>
												{selectedChild.submissions[0].updatedAt.toLocaleDateString('nl-BE', {
													year: 'numeric',
													month: 'numeric',
													day: 'numeric'
												})}
											</span>
										</div>
										<div
											class={cn(
												'flex gap-1 p-1 rounded shadow-[0_3px_6px_0_rgba(0,0,0,0.25)] min-[375px]:p-2',
												selectedChild.submissions[0].medal === 'GOLD'
													? `bg-yellow-100 ${$userSettings.theme === 'DARK' ? 'bg-opacity-25' : ''}`
													: '',
												selectedChild.submissions[0].medal === 'SILVER'
													? `bg-slate-100 ${$userSettings.theme === 'DARK' ? 'bg-opacity-25' : ''}`
													: '',
												selectedChild.submissions[0].medal === 'BRONZE'
													? `bg-orange-100 ${$userSettings.theme === 'DARK' ? 'bg-opacity-25' : ''}`
													: '',
												selectedChild.submissions[0].medal === 'NONE'
													? `bg-blue-50 ${$userSettings.theme === 'DARK' ? 'bg-opacity-25' : ''}`
													: ''
											)}
										>
											<span
												class={cn(
													'fz-ms1 min-[375px]:fz-ms2',
													selectedChild.submissions[0].medal === 'GOLD'
														? `text-yellow-950 ${$userSettings.theme === 'DARK' ? 'text-gray-200' : ''}`
														: '',
													selectedChild.submissions[0].medal === 'SILVER'
														? `text-slate-950 ${$userSettings.theme === 'DARK' ? 'text-gray-200' : ''}`
														: '',
													selectedChild.submissions[0].medal === 'BRONZE'
														? `text-orange-950 ${$userSettings.theme === 'DARK' ? 'text-gray-200' : ''}`
														: '',
													selectedChild.submissions[0].medal === 'NONE'
														? `text-blue-950 ${$userSettings.theme === 'DARK' ? 'text-gray-200' : ''}`
														: ''
												)}
											>
												<span
													class={cn(
														'float-left fz-ms6 min-[375px]:fz-ms7 mr-2 rounded',
														selectedChild.submissions[0].medal === 'GOLD' ? 'bg-yellow-300' : '',
														selectedChild.submissions[0].medal === 'SILVER' ? 'bg-slate-300' : '',
														selectedChild.submissions[0].medal === 'BRONZE' ? 'bg-orange-300' : '',
														selectedChild.submissions[0].medal === 'NONE' ? 'hidden' : ''
													)}
												>
													{#if selectedChild.submissions[0].medal === 'GOLD'}
														🥇
													{:else if selectedChild.submissions[0].medal === 'SILVER'}
														🥈
													{:else if selectedChild.submissions[0].medal === 'BRONZE'}
														🥉
													{/if}
												</span>
												{selectedChild.submissions[0].feedback}
												<!-- Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae repellendus incidunt ullam dolores rerum aliquam at distinctio alias quos eius? Unde nisi, recusandae nulla tempore laboriosam corrupti accusamus. Soluta, nostrum! -->
											</span>
										</div>
									</div>
								{:else}
									<h4
										class="fz-ms4 font-sniglet-regular text-foreground min-[375px]:fz-ms5 min-[425px]:fz-ms6"
									>
										{m.no_feedback_yet()}
									</h4>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div
					class={cn(
						'mb-6 p-4 shadow-md min-[420px]:rounded-lg min-[425px]:mx-4',
						$isMobileView ? '' : 'max-w-[30rem]',
						$userSettings.theme === 'DARK' ? 'bg-blue-950 bg-opacity-50' : 'bg-card'
					)}
				>
					<div class="flex flex-col gap-4">
						<h3
							class={cn(
								'fz-ms5 min-[375px]:fz-ms6 min-[577px]:fz-ms7 font-sniglet-extrabold',
								$userSettings.theme === 'DARK' ? 'text-foreground' : 'text-blue-950'
							)}
						>
							{m.submit_video()}
						</h3>
						<div>
							<form onsubmit={handleSubmit}>
								<input
									type="file"
									id="video"
									accept="video/*"
									onchange={handleFileChange}
									class="hidden"
									required
								/>
								<div class="flex flex-col gap-2 mb-6">
									<span
										class={cn(
											'fz-ms2 min-[425px]:text-[1rem] ',
											$userSettings.theme === 'DARK' ? 'text-gray-300' : 'text-gray-600'
										)}
									>
										{m.upload_video_medal_prompt()}
									</span>
									<div class="flex flex-col gap-1 items-center">
										<label
											for="video"
											class={cn(
												'w-full cursor-pointer fz-ms2 min-[425px]:text-[1rem] text-center px-4 py-2 rounded text-white transition-all',
												$userSettings.theme === 'DARK'
													? 'bg-green-700 hover:bg-green-800'
													: 'bg-green-500 hover:bg-green-600'
											)}
										>
											{m.choose_video()}
										</label>
										<span
											class={cn(
												'fz-ms1 min-[425px]:fz-ms2',
												$userSettings.theme === 'DARK' ? 'text-gray-500' : 'text-gray-400'
											)}
										>
											{m.supported_formats()}
										</span>
									</div>
								</div>
								<div class="flex gap-2 justify-between items-center">
									<span
										class="fz-ms2 tex-foreground truncate max-w-[50%] overflow-hidden whitespace-nowrap text-ellipsis"
									>
										{$fileName}
									</span>
									<button
										type="submit"
										class={cn(
											'max-w-[50%] fz-ms2 min-[425px]:text-[1rem] rounded px-3 py-2 transition-colors text-white',
											$userSettings.theme === 'DARK'
												? 'bg-blue-700  hover:bg-blue-800'
												: 'bg-blue-500  hover:bg-blue-600'
										)}
									>
										{m.submit_video()}
									</button>
								</div>
							</form>
							{#if message}
								<div
									class="mt-4 p-3 fz-ms2 min-[425px]:text-[1rem] font-medium rounded-md {success
										? `${$userSettings.theme === 'DARK' ? 'bg-green-500 bg-opacity-25 text-green-100' : 'bg-green-100 text-green-700'}`
										: `${$userSettings.theme === 'DARK' ? 'bg-red-500 bg-opacity-25 text-red-100' : 'bg-red-100 text-red-700'}`}"
								>
									{message}
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	* {
		scroll-behavior: smooth;
	}
</style>
