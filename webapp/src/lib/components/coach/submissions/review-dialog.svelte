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
	}

	interface Props {
		submission: Submission | null;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	const { submission, open, onOpenChange }: Props = $props();
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="sm:max-w-[600px]">
		<ReviewPanel
			{submission}
			onClose={() => onOpenChange(false)}
			onSubmit={(feedback) => {
				onOpenChange(false);
			}}
		/>
	</Dialog.Content>
</Dialog.Root>
