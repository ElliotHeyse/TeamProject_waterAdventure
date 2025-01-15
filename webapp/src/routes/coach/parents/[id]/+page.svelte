<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Button } from '$lib/components/coach/ui/button';
	import { Input } from '$lib/components/coach/ui/input';
	import { Label } from '$lib/components/coach/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/coach/ui/card';
	import { toast } from 'svelte-sonner';
	import * as Select from '$lib/components/coach/ui/select';

	let { data } = $props();
	let { parent, coaches } = data;

	let name = $state(parent.user.name);
	let email = $state(parent.user.email);
	let phone = $state(parent.phone);
	let coachId = $state(parent.coachId);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const response = await fetch(form.action, {
			method: 'POST',
			body: formData
		});

		const result = await response.json();

		if (result.type === 'success') {
			toast.success(m.changes_saved(), {
				description: m.settings_saved_description()
			});
		} else if (result.type === 'error') {
			toast.error(m.settings_save_failed(), {
				description: result.error
			});
		}
	}
</script>

<div class="container py-8">
	<Card>
		<CardHeader>
			<CardTitle>{m.edit_parent_info()}</CardTitle>
		</CardHeader>
		<CardContent>
			<form method="POST" onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="name">{m.name()}</Label>
					<Input type="text" id="name" name="name" bind:value={name} required />
				</div>

				<div class="space-y-2">
					<Label for="email">{m.email()}</Label>
					<Input type="email" id="email" name="email" bind:value={email} required />
				</div>

				<div class="space-y-2">
					<Label for="phone">{m.phone()}</Label>
					<Input type="tel" id="phone" name="phone" bind:value={phone} />
				</div>

				<div class="space-y-2">
					<Label for="coachId">{m.assigned_coach()}</Label>
					<Select.Root
						type="single"
						value={coachId || undefined}
						onValueChange={(value: string) => {
							coachId = value;
							// Also update the hidden input for form submission
							const input = document.querySelector('input[name="coachId"]') as HTMLInputElement;
							if (input) input.value = value;
						}}
					>
						<Select.Trigger class="w-full">
							<span>
								{#if coachId}
									{coaches.find((c) => c.id === coachId)?.user.name || m.select_coach()}
								{:else}
									{m.select_coach()}
								{/if}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each coaches as coach}
								<Select.Item value={coach.id} label={coach.user.name} />
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="coachId" value={coachId || ''} />
				</div>

				<Button type="submit">{m.save_changes()}</Button>
			</form>
		</CardContent>
	</Card>
</div>
