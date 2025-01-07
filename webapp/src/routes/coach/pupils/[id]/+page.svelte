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

	let { data } = $props<{ data: PageData }>();
	let isEditing = $state(false);
	let selectedLevel = $state(data.pupil.level);
	let formError = $state<string | null>(null);

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
</script>

<div class="mx-auto space-y-8 p-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-6">
			<div
				class="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/10"
			>
				<img
					src={data.pupil.profilePicture || `${defaultProfilePicture}?seed=${data.pupil.id}`}
					alt={`${data.pupil.name}'s profile picture`}
					class="h-full w-full object-cover"
				/>
			</div>
			<div class="flex flex-col">
				<div class="flex items-center gap-4">
					<h2 class="text-3xl font-bold tracking-tight">{data.pupil.name}'s Profile</h2>
					<Dialog bind:open={isEditing}>
						<DialogTrigger>
							<Button variant="outline" size="sm">Edit Profile</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit {data.pupil.name}'s Profile</DialogTitle>
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
										<Alert.Title>Error</Alert.Title>
										<Alert.Description>{formError}</Alert.Description>
									</Alert.Root>
								{/if}
								<input type="hidden" name="id" value={data.pupil.id} />
								<div class="space-y-2">
									<Label for="name">Name</Label>
									<Input id="name" name="name" value={data.pupil.name} required />
								</div>
								<div class="space-y-2">
									<Label for="level">Level</Label>
									<Select.Root
										type="single"
										value={selectedLevel}
										onValueChange={(value) => (selectedLevel = value)}
									>
										<Select.Trigger class="w-[180px]">
											{selectedLevel.charAt(0) + selectedLevel.slice(1).toLowerCase()}
										</Select.Trigger>
										<Select.Content>
											{#each levels as level}
												<Select.Item value={level}>
													{level.charAt(0) + level.slice(1).toLowerCase()}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>
								<div class="space-y-2">
									<Label for="notes">Notes</Label>
									<Textarea
										id="notes"
										name="notes"
										value={data.pupil.notes || ''}
										placeholder="Add notes about the pupil..."
										rows={4}
									/>
								</div>
								<div class="flex justify-end gap-2">
									<Button type="button" variant="outline" onclick={() => (isEditing = false)}>
										Cancel
									</Button>
									<Button type="submit">Save Changes</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
				<p class="text-muted-foreground">Manage pupil progress and view their activity</p>
			</div>
		</div>
		<a
			href="/coach/pupils"
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			Back to Pupils
		</a>
	</div>

	<!-- Pupil Overview Cards -->
	<div class="grid gap-6 md:grid-cols-3">
		<div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
			<h3 class="font-semibold">Account Details</h3>
			<dl class="mt-4 space-y-2">
				<div>
					<dt class="text-sm text-muted-foreground">Member Since</dt>
					<dd class="text-sm font-medium">{formatDate(data.pupil.createdAt)}</dd>
				</div>
				<div>
					<dt class="text-sm text-muted-foreground">Current Level</dt>
					<dd class="text-sm font-medium">
						{data.pupil.level.charAt(0) + data.pupil.level.slice(1).toLowerCase()}
					</dd>
				</div>
				{#if data.pupil.notes}
					<div>
						<dt class="text-sm text-muted-foreground">Notes</dt>
						<dd class="text-sm whitespace-pre-wrap">{data.pupil.notes}</dd>
					</div>
				{/if}
			</dl>
		</div>

		<div class="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
			<h3 class="font-semibold">Activity Overview</h3>
			<dl class="mt-4 space-y-2">
				<div>
					<dt class="text-muted-foreground text-sm">Total Lessons</dt>
					<dd class="text-sm font-medium">{data.lessons.length}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground text-sm">Total Submissions</dt>
					<dd class="text-sm font-medium">{data.pupil._count.submissions}</dd>
				</div>
				<div>
					<dt class="text-muted-foreground text-sm">Last Activity</dt>
					<dd class="text-sm font-medium">
						{data.submissions[0]
							? formatDistance(new Date(data.submissions[0].createdAt), new Date(), {
									addSuffix: true
								})
							: 'No activity yet'}
					</dd>
				</div>
			</dl>
		</div>

		<div class="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
			<h3 class="font-semibold">Recent Progress</h3>
			<div class="mt-4">
				{#if data.submissions.length === 0}
					<p class="text-muted-foreground text-sm">No submissions yet</p>
				{:else}
					<div class="space-y-2">
						{#each data.submissions.slice(0, 3) as submission}
							<div class="flex items-center justify-between rounded-md bg-muted p-2">
								<span class="text-sm">{submission.lesson.title}</span>
								<StatusBadge status={submission.status} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Submissions -->
	<div class="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">All Submissions</h3>
		{#if data.submissions.length === 0}
			<p class="text-muted-foreground">No submissions yet.</p>
		{:else}
			<div class="space-y-4">
				{#each data.submissions as submission}
					<div class="bg-muted rounded-lg border p-4">
						<div class="flex flex-col space-y-2">
							<div class="flex items-center justify-between">
								<span class="font-medium">{submission.lesson.title}</span>
								<StatusBadge status={submission.status} />
							</div>
							<div class="text-muted-foreground text-sm">
								Submitted {formatDistance(new Date(submission.createdAt), new Date(), {
									addSuffix: true
								})}
							</div>
							{#if submission.review}
								<div class="bg-background mt-2 rounded-md p-3">
									<p class="text-sm font-medium">Review Comment:</p>
									<p class="text-muted-foreground text-sm">{submission.review.comment}</p>
									<p class="text-muted-foreground mt-1 text-xs">
										Reviewed {formatDistance(new Date(submission.review.createdAt), new Date(), {
											addSuffix: true
										})}
									</p>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
