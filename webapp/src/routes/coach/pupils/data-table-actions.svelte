<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/coach/ui/button';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';

	let { id }: { id: string } = $props();
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
		<DropdownMenu.Item onclick={() => (window.location.href = `/coach/pupils/${id}/progress`)}>
			View Progress
		</DropdownMenu.Item>
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
