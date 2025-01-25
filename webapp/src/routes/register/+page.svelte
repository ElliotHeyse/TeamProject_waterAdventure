<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Icon, UserPlus } from 'svelte-hero-icons';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSelector from '$lib/components/app/layout/LanguageSelector.svelte';

	// Form state
	let name = $state('');
	let email = $state('');
	let confirmEmail = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let phone = $state('');
	let error = $state('');
	let formData = $state<{ error?: string } | undefined>(undefined);

	// Child form state
	let showChildForm = $state(false);
	let childName = $state('');
	let dateOfBirth = $state('');
	let level = $state<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

	const inputStyles =
		'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5555] focus:ring-[#FF5555] px-2 py-2 max-[375px]:fz-ms2 max-[375px]:px-4';

	const handleSubmit: SubmitFunction = () => {
		return async ({ result }) => {
			console.log('Form submission result:', result);

			if (result.type === 'failure') {
				error = result.data?.error || 'An unknown error occurred';
				console.error('Form submission failed:', error);
				formData = result.data;
			} else if (result.type === 'success') {
				if (!showChildForm) {
					// Parent registration successful, show child form
					showChildForm = true;
					error = '';
					formData = undefined;
					console.log('Parent registration successful, showing child form');
					return;
				} else {
					// Child registration successful, redirect to app
					console.log('Child registration successful, redirecting to app');
					goto('/app');
					return;
				}
			}
		};
	};
</script>

<div class="relative flex min-h-screen flex-col items-center justify-center py-16">

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
			class="overflow-hidden rounded-lg border border-gray-200 bg-white/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80 p-8 max-[425px]:p-6 max-[375px]:px-4"
		>
			<div class="mb-8 flex flex-col items-center space-y-2">
				<div class="h-12 w-12 rounded-full bg-[#FF5555]/10 p-2 text-[#FF5555]">
					<Icon src={UserPlus} class="h-full w-full" />
				</div>
				<h2 class="text-center text-2xl font-bold tracking-tight text-gray-900 max-[375px]:fz-ms5">
					{#if showChildForm}
						{m.add_child()}
					{:else}
						{m.create_account()}
					{/if}
				</h2>
				<p class="text-center text-sm text-gray-600">
					{#if showChildForm}
						{m.add_child_description()}
					{:else}
						{m.join_wateradventure()}
					{/if}
				</p>
			</div>

			<form
				method="POST"
				action={showChildForm ? '?/addChild' : '?/register'}
				use:enhance={handleSubmit}
				class="space-y-6"
			>
				{#if formData?.error}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
						<p class="font-medium">
							{#if showChildForm}
								{m.add_child_failed()}
							{:else}
								{m.registration_failed()}
							{/if}
						</p>
						<p>{formData.error}</p>
					</div>
				{/if}

				<div class="flex flex-col gap-8 mb-8">
					{#if showChildForm}
						<!-- Child Form -->
						<div class="flex flex-col gap-4">
							<div class="space-y-1">
								<label for="childName" class="text-sm font-medium text-gray-700">{m.childs_full_name()}</label>
								<input
									type="text"
									id="childName"
									name="childName"
									class={inputStyles}
									required
									value={childName}
									oninput={(e) => {
										childName = e.currentTarget.value;
										console.log('Child name updated:', childName);
									}}
									placeholder="John Doe Jr."
								/>
							</div>
							<div class="space-y-1">
								<label for="dateOfBirth" class="text-sm font-medium text-gray-700">{m.date_of_birth()}</label>
								<input
									type="date"
									id="dateOfBirth"
									name="dateOfBirth"
									class={inputStyles}
									required
									value={dateOfBirth}
									oninput={(e) => {
										dateOfBirth = e.currentTarget.value;
										console.log('Date of birth updated:', dateOfBirth);
									}}
								/>
							</div>

							<div class="space-y-1">
								<label for="level" class="text-sm font-medium text-gray-700">{m.swimming_level()}</label>
								<select
									id="level"
									name="level"
									class={inputStyles}
									required
									value={level}
									onchange={(e) => {
										level = e.currentTarget.value as typeof level;
										console.log('Level updated:', level);
									}}
								>
									<option value="BEGINNER">{m.beginner()}</option>
									<option value="INTERMEDIATE">{m.intermediate()}</option>
									<option value="ADVANCED">{m.advanced()}</option>
								</select>
							</div>
						</div>
					{:else}
						<!-- Registration Form -->
						<div class="flex flex-col gap-4">
							<div class="space-y-1">
								<label for="name" class="text-sm font-medium text-gray-700">{m.full_name()}</label>
								<input
									type="text"
									id="name"
									name="name"
									class={inputStyles}
									required
									value={name}
									oninput={(e) => (name = e.currentTarget.value)}
									placeholder="John Doe"
								/>
							</div>
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
									placeholder={m.email_placeholder()}
								/>
							</div>
							<div class="space-y-1">
								<label for="confirmEmail" class="text-sm font-medium text-gray-700">{m.confirm_email()}</label>
								<input
									type="email"
									id="confirmEmail"
									name="confirmEmail"
									class={inputStyles}
									required
									value={confirmEmail}
									oninput={(e) => (confirmEmail = e.currentTarget.value)}
									placeholder={m.email_placeholder()}
								/>
							</div>
						</div>

						<div class="flex flex-col gap-4">
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
									placeholder={m.password_placeholder()}
								/>
							</div>
							<div class="space-y-1">
								<label for="confirmPassword" class="text-sm font-medium text-gray-700">{m.confirm_password()}</label>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									class={inputStyles}
									required
									value={confirmPassword}
									oninput={(e) => (confirmPassword = e.currentTarget.value)}
									placeholder={m.password_placeholder()}
								/>
							</div>
						</div>

						<div class="space-y-1">
							<label for="phone" class="text-sm font-medium text-gray-700">{m.phone_optional()}</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								class={inputStyles}
								value={phone}
								oninput={(e) => (phone = e.currentTarget.value)}
								placeholder={m.phone_placeholder()}
							/>
						</div>
					{/if}
				</div>

				<div class="flex flex-col space-y-4">
					<Button
						type="submit"
						class={cn(
							'w-full bg-[#FF5555] text-white hover:bg-[#FF5555]/90',
							'focus-visible:ring-[#FF5555]'
						)}
					>
						{#if showChildForm}
							{m.add_child()}
						{:else}
							{m.create_account()}
						{/if}
					</Button>

					<a href="/login" class="text-center text-sm text-[#FF5555] hover:underline">
						{m.has_account()}
					</a>
				</div>
			</form>
		</div>
	</div>
</div>