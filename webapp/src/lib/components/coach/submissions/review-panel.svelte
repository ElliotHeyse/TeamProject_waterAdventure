<script lang="ts">
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

	interface Props {
		submission: Submission | null;
		onClose: () => void;
		onSubmit: (feedback: string) => void;
	}

	const { submission, onClose, onSubmit }: Props = $props();
	let feedback = $state(submission?.feedback || '');
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
				>
					{m.cancel()}
				</button>
				<button
					class="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
					onclick={() => onSubmit(feedback)}
				>
					{m.submit_review()}
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="text-muted-foreground p-6 text-center">{m.select_submission()}</div>
{/if}
