<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Icon, UserCircle } from 'svelte-hero-icons';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/components/coach/utils';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();

	let email = $state('');
	let password = $state('');

	const inputStyles =
		'flex h-9 w-full rounded-md border dark:black border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
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
					Sign in to your account
				</h2>
				<p class="text-center text-sm text-gray-600">Welcome back to WaterAdventure</p>
			</div>

			<form method="POST" use:enhance class="space-y-6">
				{#if form?.error}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
						<p class="font-medium">Authentication failed</p>
						<p>{form.error}</p>
					</div>
				{/if}

				<div class="space-y-4">
					<div class="space-y-1">
						<label for="email" class="text-sm font-medium text-gray-700">Email address</label>
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
						<label for="password" class="text-sm font-medium text-gray-700">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							class={inputStyles}
							required
							value={password}
							oninput={(e) => (password = e.currentTarget.value)}
							placeholder="Enter your password"
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
					Sign in
				</Button>
			</form>
		</div>
	</div>
</div>
