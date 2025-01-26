<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Icon, UserCircle } from 'svelte-hero-icons';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSelector from '$lib/components/app/layout/LanguageSelector.svelte';

	// Login form state
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let formData = $state<{ error?: string } | undefined>(undefined);

	const inputStyles = 'mt-1 block w-full rounded-md shadow-sm px-2 py-2 border-[#FF5555] border-2 border-opacity-0 focus-visible:outline-none focus-visible:border-opacity-100 focus-visible:bg-[#FFF9F9] fz-ms2 min-[425px]:fz-ms3';
	const labelStyles = 'font-medium text-gray-700 fz-ms1 min-[375px]:fz-ms2';

	const handleSubmit: SubmitFunction = () => {
		return async ({ result }) => {
			console.log('Form submission result:', result);

			if (result.type === 'failure') {
				error = result.data?.error || 'An unknown error occurred';
				console.error('Form submission failed:', error);
				formData = result.data;
			} else if (result.type === 'redirect') {
				console.log('Login successful, following redirect');
				goto(result.location);
			}
		};
	};
</script>

<div class="relative flex min-h-screen flex-col items-center justify-center">
	<!-- Language selector -->
	<div class="absolute top-4 right-4 z-50">
		<LanguageSelector />
	</div>

	<!-- Background split -->
	<div class="absolute inset-0">
		<div class="h-1/2 bg-[#FF5555]"></div>
		<div class="h-1/2 bg-gray-900"></div>
	</div>

	<!-- Content -->
	<div class="relative w-full max-w-md px-4">
		<div
			class="overflow-hidden rounded-lg border border-gray-200 bg-white/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80 p-4 min-[375px]:p-6 min-[425px]:p-8"
		>
			<div class="flex flex-col items-center gap-1 mb-6 min-[375px]:mb-8">
				<div class="h-12 w-12 rounded-full bg-[#FF5555]/10 p-2 text-[#FF5555]">
					<Icon src={UserCircle} class="h-full w-full" />
				</div>
				<h2 class="text-center text-2xl font-bold tracking-tight text-gray-900 max-[375px]:fz-ms5">
					{m.sign_in()}
				</h2>
				<p class="text-center text-sm text-gray-600">
					{m.welcome_back()}
				</p>
				<!-- <p class="text-center text-sm text-gray-500">{m.demo_credentials()}</p> -->
			</div>

			<form method="POST" action="?/login" use:enhance={handleSubmit} class="space-y-6">
				{#if formData?.error}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
						<p class="font-medium">{m.auth_failed()}</p>
						<p>{formData.error}</p>
					</div>
				{/if}

				<div class="flex flex-col gap-4 max-[425px]:gap-3">
					<div class="space-y-1">
						<label for="email" class={labelStyles}>{m.email_address()}</label>
						<input
							type="email"
							id="email"
							name="email"
							class={inputStyles}
							required
							value={email}
							oninput={(e) => (email = e.currentTarget.value)}
							placeholder="demo@demo.com"
						/>
					</div>

					<div class="space-y-1">
						<label for="password" class={labelStyles}>{m.password()}</label>
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

				<div class="flex flex-col space-y-4">
					<Button
						type="submit"
						class='w-full bg-[#FF5555] text-white hover:bg-[#ee4444] focus-visible:bg-[#ffbbbb] focus-visible:ring-[#FF5555] focus-visible:ring-2 focus-visible:text-[#ee4444]'
					>
						{m.sign_in_button()}
					</Button>

					<a href="/register" class="rounded-md text-center text-[#FF5555] hover:underline outline-none border-[#FF5555] border-opacity-0 focus-visible:border-opacity-100 focus-visible:bg-[#FF5555]/10 focus-visible:ring-[#FF5555] focus-visible:ring-2 w-full fz-ms1 min-[320px]:fz-ms2">
						{m.no_account()}
					</a>
				</div>
			</form>
		</div>
	</div>
</div>