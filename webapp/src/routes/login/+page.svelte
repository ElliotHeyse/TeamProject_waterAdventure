<script lang="ts">
	import { enhance } from '$app/forms';
	import { Icon, UserCircle } from 'svelte-hero-icons';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';

	let email = $state('');
	let password = $state('');

	const inputStyles =
		'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5555] focus:ring-[#FF5555]';

	function handleSubmit() {
		return async ({ form, data, action, cancel }) => {
			const response = await fetch(action, {
				method: 'POST',
				body: new FormData(form)
			});

			if (!response.ok) {
				return;
			}

			const result = await response.json();
			if (result.error) {
				return;
			}
		};
	}
</script>

<div class="relative flex min-h-screen flex-col items-center justify-center">
	<!-- Background split -->
	<div class="absolute inset-0">
		<div class="h-1/2 bg-[#FF5555]"></div>
		<div class="h-1/2 bg-gray-900"></div>
	</div>

	<!-- Content -->
	<div class="relative w-full max-w-md px-4">
		<div
			class="overflow-hidden rounded-lg border border-gray-200 bg-white/95 p-8 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80"
		>
			<div class="mb-8 flex flex-col items-center space-y-2">
				<div class="h-12 w-12 rounded-full bg-[#FF5555]/10 p-2 text-[#FF5555]">
					<Icon src={UserCircle} class="h-full w-full" />
				</div>
				<h2 class="text-center text-2xl font-bold tracking-tight text-gray-900">
					{m.sign_in()}
				</h2>
				<p class="text-center text-sm text-gray-600">
					{m.welcome_back()}
				</p>
			</div>

			<form method="POST" use:enhance={handleSubmit} class="space-y-6">
				{#if form?.error}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
						<p class="font-medium">{m.auth_failed()}</p>
						<p>{form.error}</p>
					</div>
				{/if}

				<div class="space-y-4">
					<div class="space-y-1">
						<label for="email" class="text-sm font-medium text-gray-700">{m.email_address()}</label>
						<input
							type="email"
							id="email"
							name="email"
							class={inputStyles}
							required
							value={email}
							oninput={(e) => (email = e.currentTarget.value)}
							placeholder="you@example.com"
						/>
					</div>

					<div class="space-y-1">
						<label for="password" class="text-sm font-medium text-gray-700">{m.password()}</label>
						<input
							type="password"
							id="password"
							name="password"
							class={inputStyles}
							required
							value={password}
							oninput={(e) => (password = e.currentTarget.value)}
							placeholder={m.enter_password()}
						/>
					</div>
				</div>

				<Button
					type="submit"
					class={cn(
						'w-full bg-[#FF5555] text-white hover:bg-[#FF5555]/90',
						'focus-visible:ring-[#FF5555]'
					)}
				>
					{m.sign_in_button()}
				</Button>
			</form>
		</div>
	</div>
</div>
