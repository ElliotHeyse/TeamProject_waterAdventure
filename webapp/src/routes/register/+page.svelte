<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Icon, UserPlus, PlusCircle, XCircle } from 'svelte-hero-icons';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSelector from '$lib/components/app/layout/LanguageSelector.svelte';

	interface Child {
		name: string;
		dateOfBirth: string;
		level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
	}

	// Form state
	let name = $state('');
	let email = $state('');
	let confirmEmail = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let phone = $state('');
	let children = $state<Child[]>([{ name: '', dateOfBirth: '', level: 'BEGINNER' }]);
	let error = $state('');
	let formData = $state<{ error?: string } | undefined>(undefined);

	const inputStyles = 'mt-1 block w-full rounded-md shadow-sm px-2 py-2 border-[#FF5555] border-2 border-opacity-0 focus-visible:outline-none focus-visible:border-opacity-100 focus-visible:bg-[#FFF9F9] fz-ms2 min-[425px]:fz-ms3';
	const labelStyles = 'font-medium text-gray-700 fz-ms1 min-[375px]:fz-ms2';

	function addChild() {
		children = [...children, { name: '', dateOfBirth: '', level: 'BEGINNER' }];
	}

	function removeChild(index: number) {
		if (children.length > 1) {
			children = children.filter((_, i) => i !== index);
		}
	}

	function updateChildName(index: number, value: string) {
		children[index].name = value;
		children = [...children];
	}

	function updateChildDateOfBirth(index: number, value: string) {
		children[index].dateOfBirth = value;
		children = [...children];
	}

	function updateChildLevel(index: number, value: string) {
		children[index].level = value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
		children = [...children];
	}

	const handleSubmit: SubmitFunction = () => {
		return async ({ result }) => {
			console.log('Form submission result:', result);

			if (result.type === 'failure') {
				error = result.data?.error || 'An unknown error occurred';
				console.error('Form submission failed:', error);
				formData = result.data;
			} else if (result.type === 'success') {
				goto('/app');
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
			class="overflow-hidden rounded-lg border border-gray-200 bg-white/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80 p-4 min-[375px]:p-6 min-[425px]:p-8"
		>
			<div class="flex flex-col items-center gap-1 mb-6 min-[375px]:mb-8">
				<!-- Replace the existing header section to match login spacing -->
				<div class="h-12 w-12 rounded-full bg-[#FF5555]/10 p-2 text-[#FF5555]">
				  <Icon src={UserPlus} class="h-full w-full" />
				</div>
				<h2 class="text-center text-2xl font-bold tracking-tight text-gray-900 max-[375px]:fz-ms5">
				  {m.create_account()}
				</h2>
				<p class="text-center text-sm text-gray-600">
				  {m.join_wateradventure()}
				</p>
			</div>

			<form method="POST" action="?/register" use:enhance={handleSubmit} class="space-y-6">
				{#if formData?.error}
					<div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
						<p class="font-medium">{m.registration_failed()}</p>
						<p>{formData.error}</p>
					</div>
				{/if}

				<div class="space-y-2">
					<!-- Parent Information Section -->
					<h3 class="mb-4 font-medium text-gray-900 fz-ms3 min-[1000px]:fz-ms4">{m.parent_information()}</h3>
					<div class="flex flex-col gap-8">
						<div class="flex flex-col gap-4">
							<div class="space-y-1">
								<label for="name" class={labelStyles}>{m.full_name()}</label>
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
								<label for="email" class={labelStyles}>{m.email_address()}</label>
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
								<label for="confirmEmail" class={labelStyles}>{m.confirm_email()}</label>
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
								<label for="password" class={labelStyles}>{m.password()}</label>
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
								<label for="confirmPassword" class={labelStyles}>{m.confirm_password()}</label>
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
							<label for="phone" class={labelStyles}>{m.phone_optional()}</label>
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
					</div>

					<!-- Children Information Section -->
					<div class="space-y-4 pt-6">
						<div class="flex items-center justify-between">
							<h3 class="font-medium text-gray-900 fz-ms3 min-[375px]:fz-ms4">{m.child_information()}</h3>
							<button
								type="button"
								class="fz-ms1 min-[375px]:fz-ms2 px-2 py-1 inline-flex items-center rounded-md text-center text-[#FF5555] hover:underline outline-none border-[#FF5555] border-opacity-0 focus-visible:border-opacity-100 focus-visible:bg-[#FF5555]/10 focus-visible:ring-[#FF5555] focus-visible:ring-2"
								onclick={addChild}
							>
								<Icon src={PlusCircle} class="mr-1 h-5 w-5" />
								{m.add_child()}
							</button>
						</div>

						{#each children as child, index}
							<div class="relative space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
								{#if children.length > 1}
									<button
										type="button"
										class="absolute right-2 top-2 text-gray-400 focus:text-[#FF5555] focus:font-bold !ring-0 outline-none"
										onclick={() => removeChild(index)}
									>
										<Icon src={XCircle} class="h-5 w-5" />
									</button>
								{/if}

								<div class="space-y-1">
									<label
										for="childName{index}"
										class={labelStyles}>{m.childs_full_name()}</label
									>
									<input
										type="text"
										id="childName{index}"
										name="childName{index}"
										class={inputStyles}
										required
										value={child.name}
										oninput={(e) => updateChildName(index, e.currentTarget.value)}
										placeholder="John Doe Jr."
									/>
								</div>

								<div class="space-y-1">
									<label
										for="dateOfBirth{index}"
										class={labelStyles}>{m.date_of_birth()}</label
									>
									<input
										type="date"
										id="dateOfBirth{index}"
										name="dateOfBirth{index}"
										class={inputStyles}
										required
										value={child.dateOfBirth}
										oninput={(e) => updateChildDateOfBirth(index, e.currentTarget.value)}
									/>
								</div>

								<div class="space-y-1">
									<label
										for="level{index}"
										class={labelStyles}>{m.swimming_level()}</label
									>
									<select
										id="level{index}"
										name="level{index}"
										class={inputStyles}
										required
										value={child.level}
										onchange={(e) => updateChildLevel(index, e.currentTarget.value)}
									>
										<option value="BEGINNER">{m.beginner()}</option>
										<option value="INTERMEDIATE">{m.intermediate()}</option>
										<option value="ADVANCED">{m.advanced()}</option>
									</select>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex flex-col space-y-4">
					<Button
						type="submit"
						class='w-full bg-[#FF5555] text-white hover:bg-[#ee4444] focus-visible:bg-[#ffbbbb] focus-visible:ring-[#FF5555] focus-visible:ring-2 focus-visible:text-[#ee4444]'
					>
					{m.create_account()}
					</Button>

					<a href="/login" class="rounded-md text-center text-sm text-[#FF5555] hover:underline outline-none border-[#FF5555] border-opacity-0 focus-visible:border-opacity-100 focus-visible:bg-[#FF5555]/10 focus-visible:ring-[#FF5555] focus-visible:ring-2 w-full">
						{m.has_account()}
					</a>
				</div>
			</form>
		</div>
	</div>
</div>