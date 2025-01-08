<!-- Submissions page -->
<script lang="ts">
	import { CheckCircle, Clock, Icon } from 'svelte-hero-icons';
	import { Badge } from '$lib/components/coach/ui/badge';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/utils';
	import { tv } from 'tailwind-variants';
	import StatusBadge from '$lib/components/coach/ui/badge/status-badge.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Submission {
		id: string;
		pupilName: string;
		lessonTitle: string;
		date: string;
		status: 'pending' | 'reviewed';
		videoUrl: string;
		feedback: string;
	}

	interface PageData {
		submissions: Array<{
			id: string;
			pupilName: string;
			lessonTitle: string;
			date: string;
			status: string;
			videoUrl: string;
			feedback: string;
		}>;
	}

	let { data } = $props<{ data: PageData }>();
	let submissions = $state<Submission[]>(
		data.submissions
			.map((s: Submission) => ({
				...s,
				status: s.status as 'pending' | 'reviewed'
			}))
			.filter((s: Submission) => s.status === 'pending')
	);
	let selectedSubmission = $state<Submission | null>(null);
	let feedback = $state('');

	function reviewSubmission(submission: Submission) {
		selectedSubmission = submission;
		feedback = submission.feedback;
	}

	async function submitReview() {
		if (selectedSubmission) {
			const response = await fetch(`/api/submissions/${selectedSubmission.id}/review`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ feedback })
			});

			if (response.ok) {
				submissions = submissions.filter((s) => s.id !== selectedSubmission!.id);
				selectedSubmission = null;
				feedback = '';
			}
		}
	}

	let pendingCount = $derived(submissions.length);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.pending_submissions_title()}</h2>
			<p class="text-muted-foreground">
				{pendingCount}
				{m.pending_reviews()}
			</p>
		</div>
		<Button variant="outline" href="/coach/submissions/all">{m.view_all_submissions()}</Button>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Submissions List -->
		<div class="bg-card text-card-foreground rounded-md border shadow">
			<div class="border-b p-4">
				<h3 class="font-semibold">{m.pending_submissions_title()}</h3>
			</div>
			<div class="divide-y">
				{#each submissions as submission}
					<button
						class="hover:bg-muted/50 w-full cursor-pointer p-4 text-left transition-colors"
						class:bg-accent={selectedSubmission?.id === submission.id}
						onclick={() => reviewSubmission(submission)}
					>
						<div class="flex items-start justify-between">
							<div>
								<h4 class="font-medium">{submission.pupilName}</h4>
								<p class="text-muted-foreground text-sm">{submission.lessonTitle}</p>
								<p class="text-muted-foreground text-sm">{m.submitted_on()} {submission.date}</p>
							</div>
							<StatusBadge status={submission.status.toUpperCase()} />
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Review Panel -->
		<div class="bg-card text-card-foreground rounded-md border shadow">
			{#if selectedSubmission}
				<div class="space-y-6 p-6">
					<div>
						<h3 class="text-lg font-semibold">{m.review_submission()}</h3>
						<p class="text-muted-foreground">
							{selectedSubmission.pupilName} - {selectedSubmission.lessonTitle}
						</p>
					</div>

					<div class="bg-muted flex aspect-video items-center justify-center rounded-md">
						<!-- Video player would go here -->
						<p class="text-muted-foreground">{m.video_player()}</p>
					</div>

					<div class="space-y-4">
						<label class="block">
							<span class="text-sm font-medium">{m.feedback()}</span>
							<textarea
								bind:value={feedback}
								class="bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border shadow-sm"
								rows="4"
								placeholder={m.enter_feedback()}
							></textarea>
						</label>

						<div class="flex justify-end space-x-3">
							<button
								class="bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
								onclick={() => (selectedSubmission = null)}
							>
								{m.cancel()}
							</button>
							<button
								class="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
								onclick={submitReview}
							>
								{m.submit_review()}
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="text-muted-foreground p-6 text-center">{m.select_submission()}</div>
			{/if}
		</div>
	</div>
</div>
