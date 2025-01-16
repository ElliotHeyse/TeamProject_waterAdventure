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
	import { browser } from '$app/environment';
	import { userSettings } from '$lib/stores/userSettings';
	import type { Language } from '$lib/stores/userSettings';

	let { data } = $props<{ data: PageData }>();
	let formError: string | null = $state(null);

	// Profile settings
	let bio = $state(data.coach.bio || '');
	let specialties = $state(data.coach.specialties?.join(', ') || '');

	async function toggleDarkMode() {
		const newMode = $userSettings.themeMode === 'LIGHT' ? 'DARK' : 'LIGHT';
		const success = await userSettings.updateSettings({ themeMode: newMode });
		if (success) {
			toast.success(m.changes_saved());
		} else {
			toast.error(m.settings_save_failed());
		}
	}

	async function handleLanguageChange(newLang: AvailableLanguageTag) {
		const success = await userSettings.updateSettings({ language: newLang });
		if (success) {
			const currentPath = window.location.pathname;
			const currentLang = i18n.strategy.getLanguageFromLocalisedPath(currentPath) || 'en';
			const canonicalPath = i18n.strategy.getCanonicalPath(currentPath, currentLang as Language);

			// For English, we don't need a language prefix
			if (newLang === 'en') {
				await goto(canonicalPath, { invalidateAll: true });
			} else {
				const newPath = i18n.strategy.getLocalisedPath(canonicalPath, newLang);
				await goto(newPath, { invalidateAll: true });
			}
			toast.success(m.changes_saved());
		} else {
			toast.error(m.settings_save_failed());
		}
	}

	async function handleNotificationChange(type: 'push' | 'email', enabled: boolean) {
		const update = type === 'push' 
			? { pushNotifications: enabled }
			: { emailNotifications: enabled };

		const success = await userSettings.updateSettings(update);
		if (success) {
			toast.success(m.changes_saved());
		} else {
			toast.error(m.settings_save_failed());
		}
	}
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
					<Icon src={$userSettings.themeMode === 'DARK' ? Sun : Moon} class="h-5 w-5" />
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
				<Switch
					checked={$userSettings.emailNotifications}
					onCheckedChange={(checked) => handleNotificationChange('email', checked)}
					disabled
				/>
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
				<Switch
					checked={$userSettings.pushNotifications}
					onCheckedChange={(checked) => handleNotificationChange('push', checked)}
					disabled
				/>
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
					value={$userSettings.language}
					onValueChange={(value: string) => handleLanguageChange(value as AvailableLanguageTag)}
				>
					<Select.Trigger class="w-[180px]">
						<div class="flex items-center gap-2">
							{#if $userSettings.language === 'en'}
								<Gb class="w-4 h-4" />
								<span>English</span>
							{:else if $userSettings.language === 'nl'}
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
</div>
