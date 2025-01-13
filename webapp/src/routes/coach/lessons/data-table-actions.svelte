<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/coach/ui/button';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import * as Dialog from '$lib/components/coach/ui/dialog';
	import { Pencil, Trash, ExclamationTriangle } from 'svelte-hero-icons';
	import { Icon } from 'svelte-hero-icons';
	import * as m from '$lib/paraglide/messages.js';

	let { id }: { id: string } = $props();
	let showDeleteDialog = $state(false);

	async function handleDelete() {
		const form = new FormData();
		form.append('id', id);

		const response = await fetch('?/deleteLesson', {
			method: 'POST',
			body: form
		});

		if (response.ok) {
			window.location.reload();
		}
	}
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
			<DropdownMenu.Item onclick={() => (showDeleteDialog = true)}>
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
		<DropdownMenu.Item>
			<a href="/coach/submissions/all?lessonId={id}" class="flex items-center gap-2">
				{m.view_submissions()}
			</a>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header class="flex flex-col items-center gap-4">
			<div class="rounded-full bg-red-100 p-3">
				<Icon src={ExclamationTriangle} class="h-6 w-6 text-red-600" />
			</div>
			<div class="text-center">
				<Dialog.Title class="text-lg font-semibold">{m.delete_lesson()}</Dialog.Title>
				<Dialog.Description class="mt-2">
					<p class="mb-2">{m.confirm_delete_lesson()}</p>
					<p class="text-sm text-muted-foreground">{m.confirm_delete_lesson_warning()}</p>
				</Dialog.Description>
			</div>
		</Dialog.Header>
		<div class="mt-6 flex justify-end space-x-2">
			<Button variant="outline" onclick={() => (showDeleteDialog = false)}>{m.cancel()}</Button>
			<Button variant="destructive" onclick={handleDelete}>{m.delete_lesson()}</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
