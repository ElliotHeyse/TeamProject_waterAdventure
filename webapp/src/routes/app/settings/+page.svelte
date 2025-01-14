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
	import { Badge } from '$lib/components/coach/ui/badge';
	import { Gb, Nl, Fr } from 'svelte-flags';

	let { data } = $props<{ data: PageData }>();
	// console.info(data); // dev only
	let formError: string | null = $state(null);

	// Profile settings
	let phone = $state(data.parent.phone || '');

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
	<h1 class="text-3xl font-bold mb-8">Settings</h1>
	
	<!-- Profile Settings -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-2xl font-semibold leading-none tracking-tight">{m.profile_settings()}</h3>
			<p class="text-muted-foreground text-sm">{m.manage_personal_info()}</p>
		</div>
		<Separator />
		<!-- <form
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
		-->
		<form action="" class="p-6 space-y-4">
			<div class="space-y-2">
				<Label for="name">{m.name()}</Label>
				<Input id="name" value={data.parent.user.name} disabled />
			</div>
			<div class="space-y-2">
				<Label for="email">{m.email()}</Label>
				<Input id="email" type="email" value={data.parent.user.email} disabled />
			</div>
			<div class="space-y-2">
				<Label for="bio">{m.phone()}</Label>
				<Input id="phone" name="phone" bind:value={phone} placeholder="phone placeholder (update lang message)" />
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
			<p class="text-muted-foreground text-sm">Customize appearance [update message lang]</p>
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
					<div class="flex items-center gap-2">
						<Label>{m.email_notifications()}</Label>
						<Badge variant="secondary" class="text-xs">Soon</Badge>
					</div>
					<div class="text-sm text-muted-foreground">
						{m.email_notifications_description()}
					</div>
				</div>
				<Switch bind:checked={emailNotifications} disabled />
			</div>
			<Separator />
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<div class="flex items-center gap-2">
						<Label>{m.push_notifications()}</Label>
						<Badge variant="secondary" class="text-xs">Soon</Badge>
					</div>
					<div class="text-sm text-muted-foreground">
						{m.push_notifications_description()}
					</div>
				</div>
				<Switch bind:checked={pushNotifications} disabled />
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
						<div class="flex items-center gap-2">
							{#if currentLanguage === 'en'}
								<Gb class="w-4 h-4" />
								<span>English</span>
							{:else if currentLanguage === 'nl'}
								<Nl class="w-4 h-4" />
								<span>Dutch</span>
							{:else}
								<Fr class="w-4 h-4" />
								<span>French</span>
							{/if}
						</div>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="en">
							<div class="flex items-center gap-2">
								<Gb class="w-4 h-4" />
								<span>English</span>
							</div>
						</Select.Item>
						<Select.Item value="nl">
							<div class="flex items-center gap-2">
								<Nl class="w-4 h-4" />
								<span>Dutch</span>
							</div>
						</Select.Item>
						<Select.Item value="fr">
							<div class="flex items-center gap-2">
								<Fr class="w-4 h-4" />
								<span>French</span>
							</div>
						</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>

	<!-- Partners -->
	<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<em>Bij small width (app weergave): partners hier tonen.</em>
			<em>Bij large width (desktop weergave) partners in bottom zijkant tonen.</em>
			<Separator />
			<p><a href="https://www.zwemfed.be">Zwemfed logo</a></p>
			<p><a href="https://www.sportinnovatiecampus.be">Sportinnovatiecampus Brugge logo</a></p>
			<p><a href="https://www.howest.be/en">Howest logo</a></p>
		</div>
	</div>
</div>