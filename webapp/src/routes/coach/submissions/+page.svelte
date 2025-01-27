<!-- Submissions page -->
<script lang="ts">
	import { Button } from '$lib/components/coach/ui/button';
	import * as m from '$lib/paraglide/messages.js';
	import ReviewPanel, {
		type Submission
	} from '$lib/components/coach/submissions/review-panel.svelte';

	let { data } = $props<{
		data: {
			submissions: Submission[];
		};
	}>();
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
						onclick={() => {
							selectedSubmission = submission;
						}}
						class="w-full text-left hover:bg-accent transition-colors duration-200 group relative {selectedSubmission?.id ===
						submission.id
							? 'bg-accent'
							: ''}"
					>
						<div class="p-6 space-y-4">
							<div
								class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
							>
								<div class="space-y-1.5">
									<h3 class="text-lg font-semibold group-hover:text-primary transition-colors">
										{submission.pupilName}
									</h3>
									<p class="text-muted-foreground font-medium">{submission.lessonTitle}</p>
									<p class="text-sm text-muted-foreground">
										{m.submitted_on()}
										{submission.date}
									</p>
								</div>
								<div>
									<span
										class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {submission.status ===
										'reviewed'
											? 'bg-green-100 text-green-800'
											: 'bg-yellow-100 text-yellow-800'}"
									>
										{submission.status === 'reviewed' ? m.reviewed() : m.pending()}
									</span>
								</div>
							</div>
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
