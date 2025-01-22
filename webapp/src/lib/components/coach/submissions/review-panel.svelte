<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from 'lucide-svelte';
	import { page } from '$app/state';

	export interface Submission {
		id: string;
		pupilName: string;
		lessonTitle: string;
		date: string;
		status: 'pending' | 'reviewed';
		videoUrl: string;
		feedback: string;
		medal?: 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';
	}

	interface Props {
		submission: Submission | null;
		onClose: () => void;
		onSubmit: (feedback: string, medal: string) => void;
	}

	const { submission, onClose, onSubmit }: Props = $props();
	let feedback = $state(submission?.feedback || '');
	let medal = $state(submission?.medal || 'NONE');
	let isSubmitting = $state(false);
	let videoError = $state(false);

	function handleVideoError() {
		videoError = true;
		toast.error(m.error_loading_video());
	}

	async function handleSubmit() {
		if (!submission) return;

		isSubmitting = true;
		try {
			const response = await fetch(`/api/submissions/${submission.id}/review`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ feedback, medal })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to submit review');
			}

			toast.success(m.review_submitted());
			onSubmit(feedback, medal);
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

		<div class="bg-muted rounded-md overflow-hidden">
			{#if !videoError}
				<video class="w-full aspect-video" controls onerror={handleVideoError}>
					<source src={submission.videoUrl} type="video/mp4" />
					<track kind="captions" />
					{m.video_not_supported()}
				</video>
			{:else}
				<div class="flex items-center justify-center aspect-video">
					<p class="text-muted-foreground">{m.error_loading_video()}</p>
				</div>
			{/if}
		</div>

		<div class="space-y-4">
			<label class="block">
				<span class="text-sm font-medium">{m.feedback()}</span>
				<textarea
					bind:value={feedback}
					class="bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-lg border shadow-sm text-base p-4"
					rows="6"
					placeholder={m.enter_feedback()}
				></textarea>
			</label>

			<label class="block">
				<span class="text-sm font-medium">Medaille</span>
				<select
					bind:value={medal}
					class="bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-lg border shadow-sm text-base p-2"
				>
					<option value="NONE">Geen</option>
					<option value="BRONZE">Brons</option>
					<option value="SILVER">Zilver</option>
					<option value="GOLD">Goud</option>
				</select>
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
