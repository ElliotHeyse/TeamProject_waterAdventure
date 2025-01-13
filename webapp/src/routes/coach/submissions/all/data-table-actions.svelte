<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/coach/ui/button';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import ReviewDialog from '$lib/components/coach/submissions/review-dialog.svelte';
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

	let props = $props<{ submission: Submission }>();
	let showReviewDialog = $state(false);

	async function handleSubmitReview(feedback: string) {
		const response = await fetch(`/api/submissions/${props.submission.id}/review`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ feedback })
		});

		if (response.ok) {
			// Refresh the page to show updated data
			window.location.reload();
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => (showReviewDialog = true)}>
			{m.review_submission()}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<ReviewDialog
	submission={props.submission}
	open={showReviewDialog}
	onOpenChange={(open) => (showReviewDialog = open)}
/>
