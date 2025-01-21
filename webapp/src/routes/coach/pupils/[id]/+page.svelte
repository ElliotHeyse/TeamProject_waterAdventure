<script lang="ts">
	import type { PageData } from './$types';
	import { formatDistance } from 'date-fns';
	import StatusBadge from '$lib/components/coach/ui/badge/status-badge.svelte';
	import { Button } from '$lib/components/coach/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/coach/ui/dialog';
	import { Label } from '$lib/components/coach/ui/label';
	import { Input } from '$lib/components/coach/ui/input';
	import { Textarea } from '$lib/components/coach/ui/textarea';
	import * as Select from '$lib/components/coach/ui/select';
	import * as Alert from '$lib/components/coach/ui/alert';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { CircleAlert } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import ReviewDialog from '$lib/components/coach/submissions/review-dialog.svelte';
	import medalGold from '$lib/img/medail-gold.svg';
	import medalSilver from '$lib/img/medail-silver.svg';
	import medalBronze from '$lib/img/medail-bronze.svg';

	let { data } = $props<{ data: PageData }>();
	let isEditing = $state(false);
	let selectedLevel = $state(data.pupil.level);
	let formError = $state<string | null>(null);
	let isReviewDialogOpen = $state(false);
	let selectedSubmission = $state(null);
	let isProgressDialogOpen = $state(false);

	const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	const defaultProfilePicture = 'https://api.dicebear.com/7.x/avataaars/svg';

	function handleSubmit(event: SubmitEvent) {
		const form = event.target as HTMLFormElement;
		const levelInput = document.createElement('input');
		levelInput.type = 'hidden';
		levelInput.name = 'level';
		levelInput.value = selectedLevel;
		form.appendChild(levelInput);
	}

	function openReviewDialog(submission: any) {
		selectedSubmission = submission;
		isReviewDialogOpen = true;
	}
</script>

<div class="mx-auto space-y-8 p-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-6">
			<div
				class="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/10"
			>
				<img
					src={data.pupil.profilePicture || `${defaultProfilePicture}?seed=${data.pupil.id}`}
					alt={`${data.pupil.name}'s ${m.profile_picture()}`}
					class="h-full w-full object-cover"
				/>
			</div>
			<div class="flex flex-col">
				<div class="flex items-center gap-4">
					<h2 class="text-3xl font-bold tracking-tight">{data.pupil.name}'s {m.profile()}</h2>
					<Dialog bind:open={isEditing}>
						<DialogTrigger>
							<Button variant="outline" size="sm">{m.edit_profile()}</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{m.edit_profile_title({ name: data.pupil.name })}</DialogTitle>
							</DialogHeader>
							<form
								method="POST"
								action="?/updatePupil"
								use:enhance={() => {
									formError = null;
									return async ({ result }) => {
										if (result.type === 'error') {
											formError = result.error.message;
										} else {
											await invalidateAll();
											isEditing = false;
										}
									};
								}}
								onsubmit={handleSubmit}
								class="space-y-4"
							>
								{#if formError}
									<Alert.Root variant="destructive">
										<CircleAlert class="h-4 w-4" />
										<Alert.Title>{m.error()}</Alert.Title>
										<Alert.Description>{formError}</Alert.Description>
									</Alert.Root>
								{/if}
								<input type="hidden" name="id" value={data.pupil.id} />
								<div class="space-y-2">
									<Label for="name">{m.name()}</Label>
									<Input id="name" name="name" value={data.pupil.name} required />
								</div>
								<div class="space-y-2">
									<Label for="notes">{m.notes()}</Label>
									<Textarea
										id="notes"
										name="notes"
										value={data.pupil.notes || ''}
										placeholder={m.notes_placeholder()}
										rows={4}
									/>
								</div>
								<div class="flex justify-end gap-2">
									<Button type="button" variant="outline" onclick={() => (isEditing = false)}>
										{m.cancel()}
									</Button>
									<Button type="submit">{m.save_changes()}</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
				<p class="text-muted-foreground">{m.manage_pupil_progress()}</p>
			</div>
		</div>
		<a
			href="/coach/pupils"
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			{m.back_to_pupils()}
		</a>
	</div>

	<!-- Pupil Overview Cards -->
	<div class="grid gap-6 md:grid-cols-3">
		<div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
			<h3 class="font-semibold">{m.account_details()}</h3>
			<dl class="mt-4 space-y-2">
				<div>
					<dt class="text-sm text-muted-foreground">{m.member_since()}</dt>
					<dd class="text-sm font-medium">{formatDate(data.pupil.createdAt)}</dd>
				</div>
				{#if data.pupil.notes}
					<div>
						<dt class="text-sm text-muted-foreground">{m.notes()}</dt>
						<dd class="text-sm whitespace-pre-wrap">{data.pupil.notes}</dd>
					</div>
				{/if}
			</dl>
		</div>

		<div class="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
			<h3 class="font-semibold">{m.parent_information()}</h3>
			<dl class="mt-4 space-y-2">
				<div>
					<dt class="text-sm text-muted-foreground">{m.name()}</dt>
					<dd class="text-sm font-medium">{data.pupil.parent.user.name}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">{m.email()}</dt>
					<dd class="text-sm font-medium">{data.pupil.parent.user.email}</dd>
				</div>
				{#if data.pupil.parent.phone}
					<div>
						<dt class="text-sm text-muted-foreground">{m.phone()}</dt>
						<dd class="text-sm font-medium">{data.pupil.parent.phone}</dd>
					</div>
				{/if}
			</dl>
		</div>

		<div class="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
			<h3 class="font-semibold">{m.activity_overview()}</h3>
			<dl class="mt-4 space-y-2">
				<div>
					<dt class="text-muted-foreground text-sm">{m.lesson_progress()}</dt>
					<dd class="mt-2">
						<Dialog bind:open={isProgressDialogOpen}>
							<DialogTrigger>
								<button class="w-full">
									<div class="h-2 w-full rounded-full bg-muted">
										<div
											class="h-full rounded-full bg-primary transition-all"
											style="width: {(data.completedLessons / data.totalLessons) * 100}%"
										></div>
									</div>
									<p class="mt-1 text-sm font-medium">
										{data.completedLessons}
										{m.out_of()}
										{data.totalLessons}
										{m.lessons_completed()}
									</p>
								</button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>{m.recent_progress()}</DialogTitle>
								</DialogHeader>
								<div class="space-y-4">
									{#if data.submissions.length === 0}
										<p class="text-muted-foreground">{m.no_submissions()}</p>
									{:else}
										<div class="space-y-4">
											{#each data.submissions.slice(0, 5) as submission}
												<div class="flex items-center justify-between rounded-md bg-muted p-4">
													<div class="space-y-1">
														<p class="font-medium">{submission.level.languageContents[0].title}</p>
														<p class="text-sm text-muted-foreground">
															{m.submitted()}
															{formatDistance(new Date(submission.createdAt), new Date(), {
																addSuffix: true
															})}
														</p>
													</div>
													<div class="flex items-center gap-4">
														<StatusBadge status={submission.status} />
														<Button
															variant="outline"
															size="sm"
															onclick={() => openReviewDialog(submission)}
														>
															{m.review_submission()}
														</Button>
													</div>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							</DialogContent>
						</Dialog>
					</dd>
				</div>
				<div>
					<dt class="text-muted-foreground text-sm">{m.total_submissions()}</dt>
					<dd class="text-sm font-medium">{data.pupil._count.submissions}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground text-sm">{m.last_activity()}</dt>
					<dd class="text-sm font-medium">
						{data.submissions[0]
							? formatDistance(new Date(data.submissions[0].createdAt), new Date(), {
									addSuffix: true
								})
							: m.no_activity()}
					</dd>
				</div>
			</dl>
		</div>
	</div>

	<!-- Submissions -->
	<div class="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">{m.all_submissions()}</h3>
		{#if data.submissions.length === 0}
			<p class="text-muted-foreground">{m.no_submissions()}</p>
		{:else}
			<div class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					{#each data.submissions as submission}
						<button
							class="group w-full rounded-lg border bg-muted p-4 text-left transition-colors hover:bg-muted/80"
							onclick={() => openReviewDialog(submission)}
							aria-label={m.review_submission()}
						>
							<div class="flex flex-col space-y-3">
								<div class="flex items-start justify-between gap-4">
									<div class="space-y-1">
										<h4 class="font-medium leading-none">
											{submission.level.languageContents[0].title}
										</h4>
										<p class="text-sm text-muted-foreground">
											{m.submitted()}
											{formatDistance(new Date(submission.createdAt), new Date(), {
												addSuffix: true
											})}
										</p>
									</div>
									<StatusBadge status={submission.status} />
								</div>
								{#if submission.review}
									<div class="rounded-md bg-background/50 p-3">
										<div class="flex flex-col gap-2">
											<p class="text-sm font-medium leading-none">{m.review_comment()}</p>
											<p class="text-sm text-muted-foreground">{submission.review.comment}</p>
											{#if submission.medal !== 'NONE'}
												<div class="flex items-center gap-2">
													<span class="text-sm font-medium">Medaille:</span>
													<div class="flex items-center gap-1">
														{#if submission.medal === 'GOLD'}
															<img src={medalGold} alt="Gouden medaille" class="h-5 w-5" />
															<span class="text-sm">Goud</span>
														{:else if submission.medal === 'SILVER'}
															<img src={medalSilver} alt="Zilveren medaille" class="h-5 w-5" />
															<span class="text-sm">Zilver</span>
														{:else if submission.medal === 'BRONZE'}
															<img src={medalBronze} alt="Bronzen medaille" class="h-5 w-5" />
															<span class="text-sm">Brons</span>
														{/if}
													</div>
												</div>
											{/if}
											<p class="text-xs text-muted-foreground/80">
												{m.reviewed()}
												{formatDistance(new Date(submission.review.createdAt), new Date(), {
													addSuffix: true
												})}
											</p>
										</div>
									</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<ReviewDialog
		submission={selectedSubmission}
		open={isReviewDialogOpen}
		onOpenChange={(open) => (isReviewDialogOpen = open)}
	/>
</div>
