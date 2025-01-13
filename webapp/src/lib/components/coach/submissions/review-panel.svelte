<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from 'lucide-svelte';

	interface Submission {
		id: string;
		pupilName: string;
		lessonTitle: string;
		date: string;
		status: 'pending' | 'reviewed';
		videoUrl: string;
		feedback: string;
	}

	interface Props {
		submission: Submission | null;
		onClose: () => void;
		onSubmit: (feedback: string) => void;
	}

	const { submission, onClose, onSubmit }: Props = $props();
	let feedback = $state(submission?.feedback || '');
	let isSubmitting = $state(false);

	async function handleSubmit() {
		if (!submission) return;

		isSubmitting = true;
		try {
			const response = await fetch(`/api/submissions/${submission.id}/review`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ feedback })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to submit review');
			}

			toast.success(m.review_submitted());
			onSubmit(feedback);
		} catch (error) {
			console.error('Error:', error);
			toast.error(m.error_submitting_review());
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if submission}
	<div class="space-y-6">
		<div>
			<h3 class="text-lg font-semibold">{m.review_submission()}</h3>
			<p class="text-muted-foreground">
				{submission.pupilName} - {submission.lessonTitle}
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
					onclick={onClose}
					disabled={isSubmitting}
				>
					{m.cancel()}
				</button>
				<button
					class="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
					onclick={handleSubmit}
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<Loader2 class="h-4 w-4 animate-spin" />
						{m.submitting()}
					{:else}
						{m.submit_review()}
					{/if}
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="text-muted-foreground p-6 text-center">{m.select_submission()}</div>
{/if}
