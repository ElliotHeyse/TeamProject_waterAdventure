<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/coach/ui/button';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import { Icon, Pencil, Trash } from 'svelte-hero-icons';
	import * as m from '$lib/paraglide/messages.js';

	let { id }: { id: string } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item onclick={() => navigator.clipboard.writeText(id)}>
				<span class="flex items-center gap-2 text-red-500">
					<Icon src={Trash} class="h-4 w-4" />
					{m.delete_lesson()}
				</span>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<span class="flex items-center gap-2 text-blue-500">
					<Icon src={Pencil} class="h-4 w-4" />
					{m.edit_lesson()}
				</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>{m.view_submissions()}</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
