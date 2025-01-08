<script lang="ts">
	import { Label } from '$lib/components/coach/ui/label';
	import { Input } from '$lib/components/coach/ui/input';
	import { Button } from '$lib/components/coach/ui/button';
	import { Switch } from '$lib/components/coach/ui/switch';
	import * as Select from '$lib/components/coach/ui/select';
	import { Separator } from '$lib/components/coach/ui/separator';
	import { Icon, Sun, Moon } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/coach/ui/alert/alert.svelte';
	import AlertTitle from '$lib/components/coach/ui/alert/alert-title.svelte';
	import AlertDescription from '$lib/components/coach/ui/alert/alert-description.svelte';
	import { CircleAlert } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { i18n } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';

	let { data } = $props<{ data: PageData }>();
	let formError: string | null = $state(null);

	// Profile settings
	let bio = $state(data.coach.bio || '');
	let specialties = $state(data.coach.specialties?.join(', ') || '');

	// Appearance settings
	let isDarkMode = $state(false);

	// Notification settings
	let emailNotifications = $state(true);
	let pushNotifications = $state(true);

	// Account settings
	let currentLanguage = $state<AvailableLanguageTag>(
		(i18n.strategy.getLanguageFromLocalisedPath(window.location.pathname) ||
			'en') as AvailableLanguageTag
	);

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		document.documentElement.classList.toggle('dark', isDarkMode);
		localStorage.setItem('darkMode', isDarkMode.toString());
	}

	async function handleLanguageChange(newLang: AvailableLanguageTag) {
		const currentPath = window.location.pathname;
		const canonicalPath = i18n.strategy.getCanonicalPath(currentPath, currentLanguage);
		const newPath = i18n.strategy.getLocalisedPath(canonicalPath, newLang);
		currentLanguage = newLang;
		await goto(newPath, { invalidateAll: true });
	}

	onMount(() => {
		const savedDarkMode = localStorage.getItem('darkMode') === 'true';
		isDarkMode = savedDarkMode;
		document.documentElement.classList.toggle('dark', savedDarkMode);
	});
</script>

<div class="mx-auto space-y-6">
	<h1 class="text-3xl font-bold mb-8">{m.settings()}</h1>
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">{m.profile_settings()}</h3>
			<p class="text-muted-foreground text-sm">{m.manage_personal_info()}</p>
		</div>
		<Separator />
		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				formError = null;
				return async ({ result }) => {
					if (result.type === 'failure') {
						formError = result.data?.message as string;
						toast.error(m.settings_save_failed(), {
							description: result.data?.message as string
						});
					} else {
						toast.success(m.settings_saved(), {
							description: m.settings_saved_description()
						});
					}
				};
			}}
			class="p-6 space-y-4"
		>
			{#if formError}
				<div class="alert-wrapper">
					<Alert variant="destructive">
						<CircleAlert class="h-4 w-4" />
						<AlertTitle>{m.error()}</AlertTitle>
						<AlertDescription>{formError}</AlertDescription>
					</Alert>
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="name">{m.name()}</Label>
				<Input id="name" value={data.coach.user.name} disabled />
			</div>
			<div class="space-y-2">
				<Label for="email">{m.email()}</Label>
				<Input id="email" type="email" value={data.coach.user.email} disabled />
			</div>
			<div class="space-y-2">
				<Label for="bio">{m.bio()}</Label>
				<Input id="bio" name="bio" bind:value={bio} placeholder={m.bio_placeholder()} />
			</div>
			<div class="space-y-2">
				<Label for="specialties">{m.specialties()}</Label>
				<Input
					id="specialties"
					name="specialties"
					bind:value={specialties}
					placeholder={m.specialties_placeholder()}
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit">{m.save_profile()}</Button>
			</div>
		</form>
	</div>

	<!-- Appearance Settings -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">{m.appearance()}</h3>
			<p class="text-muted-foreground text-sm">{m.customize_appearance()}</p>
		</div>
		<Separator />
		<div class="p-6">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>{m.dark_mode()}</Label>
					<div class="text-sm text-muted-foreground">{m.dark_mode_description()}</div>
				</div>
				<Button variant="outline" size="icon" onclick={toggleDarkMode}>
					<Icon src={isDarkMode ? Sun : Moon} class="h-5 w-5" />
				</Button>
			</div>
		</div>
	</div>

	<!-- Notification Settings -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">{m.notifications()}</h3>
			<p class="text-muted-foreground text-sm">{m.manage_notifications()}</p>
		</div>
		<Separator />
		<div class="p-6 space-y-4">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>{m.email_notifications()}</Label>
					<div class="text-sm text-muted-foreground">
						{m.email_notifications_description()}
					</div>
				</div>
				<Switch bind:checked={emailNotifications} />
			</div>
			<Separator />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label>{m.push_notifications()}</Label>
					<div class="text-sm text-muted-foreground">
						{m.push_notifications_description()}
					</div>
				</div>
				<Switch bind:checked={pushNotifications} />
			</div>
		</div>
	</div>

	<!-- Account Settings -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">{m.account_settings()}</h3>
			<p class="text-muted-foreground text-sm">{m.manage_account()}</p>
		</div>
		<Separator />
		<div class="p-6 space-y-4">
			<div class="space-y-2">
				<Label>{m.language()}</Label>
				<Select.Root
					type="single"
					value={currentLanguage}
					onValueChange={(value: string) => handleLanguageChange(value as AvailableLanguageTag)}
				>
					<Select.Trigger class="w-[180px]">
						<span>
							{currentLanguage === 'en' ? 'English' : currentLanguage === 'nl' ? 'Dutch' : 'French'}
						</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="en">English</Select.Item>
						<Select.Item value="nl">Dutch</Select.Item>
						<Select.Item value="fr">French</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>
</div>
