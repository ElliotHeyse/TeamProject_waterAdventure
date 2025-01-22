<script lang="ts">
	import { Label } from '$lib/components/coach/ui/label';
	import { Input } from '$lib/components/coach/ui/input';
	import { Button } from '$lib/components/coach/ui/button';
	import { Switch } from '$lib/components/coach/ui/switch';
	import * as Select from '$lib/components/coach/ui/select';
	import { Separator } from '$lib/components/coach/ui/separator';
	import { Icon, Sun, Moon } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { i18n } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import type { Language } from '$lib/stores/userSettings';
	import { Badge } from '$lib/components/coach/ui/badge';
	import { browser } from '$app/environment';
	import { Alert, AlertTitle, AlertDescription } from '$lib/components/coach/ui/alert';
	import { userSettings } from '$lib/stores/userSettings';
	import { CircleAlert } from 'lucide-svelte';

	const { data } = $props<{ data: PageData }>();
	let formError: string | null = $state(null);

	// Profile settings
	let phone = $state(data?.parent?.phone || '');

	// Keep track of theme locally to prevent flashing
	let currentTheme = $state($userSettings.theme);

	// Initialize theme on mount
	onMount(() => {
		if (browser) {
			document.documentElement.classList.toggle('dark', currentTheme === 'DARK');
		}
	});

	async function toggleDarkMode() {
		const newMode = currentTheme === 'LIGHT' ? 'DARK' : 'LIGHT';
		const success = await userSettings.updateSettings({ theme: newMode });
		if (success) {
			currentTheme = newMode;
			document.documentElement.classList.toggle('dark', newMode === 'DARK');
			toast.success(m.changes_saved());
		} else {
			toast.error(m.settings_save_failed());
		}
	}

	async function handleLanguageChange(newLang: AvailableLanguageTag) {
		// Store current theme state
		const themeBeforeChange = currentTheme;
		
		const success = await userSettings.updateSettings({ 
			language: newLang,
			theme: themeBeforeChange
		});

		if (success) {
			// Force the theme to stay consistent
			if (browser) {
				document.documentElement.classList.toggle('dark', themeBeforeChange === 'DARK');
			}

			const currentPath = window.location.pathname;
			const currentLang = i18n.strategy.getLanguageFromLocalisedPath(currentPath) || 'en';
			const canonicalPath = i18n.strategy.getCanonicalPath(currentPath, currentLang as Language);

			// Navigate with preserved theme
			if (newLang === 'en') {
				await goto(canonicalPath, { 
					invalidateAll: true,
					state: { preservedTheme: themeBeforeChange }
				});
			} else {
				const newPath = i18n.strategy.getLocalisedPath(canonicalPath, newLang);
				await goto(newPath, { 
					invalidateAll: true,
					state: { preservedTheme: themeBeforeChange }
				});
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

<div class="px-4 py-4 lg:px-8">
	<div class="mx-auto space-y-6">
		<h1 class="text-3xl font-bold mb-8">{m.settings()}</h1>

		<!-- Profile Settings -->
		<div class="bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class="flex flex-col space-y-1.5 p-6">
				<h3 class="text-2xl font-semibold leading-none tracking-tight">{m.profile_settings()}</h3>
				<p class="text-muted-foreground text-sm">{m.manage_personal_info()}</p>
			</div>
			<Separator />
			<form method="POST" action="?/updateProfile" class="p-6 space-y-4" onsubmit={handleSubmit}>
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
					<Input id="name" value={data.parent.user.name} disabled />
				</div>
				<div class="space-y-2">
					<Label for="email">{m.email()}</Label>
					<Input id="email" type="email" value={data.parent.user.email} disabled />
				</div>
				<div class="space-y-2">
					<Label for="phone">{m.phone()}</Label>
					<Input
						id="phone"
						name="phone"
						bind:value={phone}
						placeholder="phone placeholder (static => update paraglide)"
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
						<Icon src={currentTheme === 'DARK' ? Sun : Moon} class="h-5 w-5" />
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
							<div class="flex items-center">
								{#if $userSettings.language === 'en'}
									<span>English</span>
								{:else if $userSettings.language === 'nl'}
									<span>Nederlands</span>
								{:else}
									<span>Français</span>
								{/if}
							</div>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="en">English</Select.Item>
							<Select.Item value="nl">Nederlands</Select.Item>
							<Select.Item value="fr">Français</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>
	</div>
</div>
