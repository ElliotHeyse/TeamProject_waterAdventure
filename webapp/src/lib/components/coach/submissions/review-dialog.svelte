<script lang="ts">
	import * as Dialog from '$lib/components/coach/ui/dialog';
	import ReviewPanel from './review-panel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Submission {
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
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	const { submission, open, onOpenChange }: Props = $props();

	async function handleSubmit(feedback: string, medal: string) {
		onOpenChange(false);
		// Reload the page to show updated data
		window.location.reload();
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[600px]">
		<ReviewPanel
			{submission}
			onClose={() => onOpenChange(false)}
			onSubmit={handleSubmit}
		/>
	</Dialog.Content>
</Dialog.Root>
