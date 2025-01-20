<!-- Submissions page -->
<script lang="ts">
	import { CheckCircle, Clock, Icon } from 'svelte-hero-icons';
	import { Badge } from '$lib/components/coach/ui/badge';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/utils';
	import { tv } from 'tailwind-variants';
	import StatusBadge from '$lib/components/coach/ui/badge/status-badge.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import ReviewPanel from '$lib/components/coach/submissions/review-panel.svelte';

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

	async function submitReview(feedback: string, medal: string) {
		if (selectedSubmission) {
			const response = await fetch(`/api/submissions/${selectedSubmission.id}/review`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ feedback, medal })
			});

			if (response.ok) {
				submissions = submissions.filter((s) => s.id !== selectedSubmission!.id);
				selectedSubmission = null;
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
						onclick={() => (selectedSubmission = submission)}
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
		<div class="bg-card text-card-foreground rounded-md border shadow p-8">
			<ReviewPanel
				submission={selectedSubmission}
				onClose={() => (selectedSubmission = null)}
				onSubmit={submitReview}
			/>
		</div>
	</div>
</div>
