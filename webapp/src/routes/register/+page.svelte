<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Icon, UserPlus } from 'svelte-hero-icons';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/utils';

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
		'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5555] focus:ring-[#FF5555] px-2 py-2';

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
					<Icon src={UserPlus} class="h-full w-full" />
				</div>
				<h2 class="text-center text-2xl font-bold tracking-tight text-gray-900">
					{#if showChildForm}
						Add Your Child
					{:else}
						Create Account
					{/if}
				</h2>
				<p class="text-center text-sm text-gray-600">
					{#if showChildForm}
						Add your child's information to get started with swimming lessons
					{:else}
						Join WaterAdventure today!
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
								Failed to add child
							{:else}
								Registration failed
							{/if}
						</p>
						<p>{formData.error}</p>
					</div>
				{/if}

				<div class="space-y-4">
					{#if showChildForm}
						<!-- Child Form -->
						<div class="space-y-1">
							<label for="childName" class="text-sm font-medium text-gray-700">Child's Full Name</label>
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
							<label for="dateOfBirth" class="text-sm font-medium text-gray-700">Date of Birth</label>
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
							<label for="level" class="text-sm font-medium text-gray-700">Swimming Level</label>
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
								<option value="BEGINNER">Beginner</option>
								<option value="INTERMEDIATE">Intermediate</option>
								<option value="ADVANCED">Advanced</option>
							</select>
						</div>
					{:else}
						<!-- Registration Form -->
						<div class="space-y-1">
							<label for="name" class="text-sm font-medium text-gray-700">Full Name</label>
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
							<label for="email" class="text-sm font-medium text-gray-700">Email Address</label>
							<input
								type="email"
								id="email"
								name="email"
								class={inputStyles}
								required
								value={email}
								oninput={(e) => (email = e.currentTarget.value)}
								placeholder="your@email.com"
							/>
						</div>

						<div class="space-y-1">
							<label for="confirmEmail" class="text-sm font-medium text-gray-700">Confirm Email</label>
							<input
								type="email"
								id="confirmEmail"
								name="confirmEmail"
								class={inputStyles}
								required
								value={confirmEmail}
								oninput={(e) => (confirmEmail = e.currentTarget.value)}
								placeholder="your@email.com"
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

						<div class="space-y-1">
							<label for="confirmPassword" class="text-sm font-medium text-gray-700"
								>Confirm Password</label
							>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								class={inputStyles}
								required
								value={confirmPassword}
								oninput={(e) => (confirmPassword = e.currentTarget.value)}
								placeholder="Enter your password"
							/>
						</div>

						<div class="space-y-1">
							<label for="phone" class="text-sm font-medium text-gray-700">Phone Number (Optional)</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								class={inputStyles}
								value={phone}
								oninput={(e) => (phone = e.currentTarget.value)}
								placeholder="+1234567890"
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
							Add Child
						{:else}
							Create Account
						{/if}
					</Button>

					<a href="/login" class="text-center text-sm text-[#FF5555] hover:underline">
						Already have an account? Sign in
					</a>
				</div>
			</form>
		</div>
	</div>
</div> 