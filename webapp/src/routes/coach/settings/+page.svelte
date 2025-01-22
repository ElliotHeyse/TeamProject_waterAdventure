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
	import type { Language } from '$lib/i18n/i18n-types';
	import { Badge } from '$lib/components/coach/ui/badge';
	import { browser } from '$app/environment';
	import { userSettings } from '$lib/stores/userSettings';

	// Branding
	import mctLogoBlue from '$lib/img/brandkit/MCT-blue.svg';
	import mctLogoBlack from '$lib/img/brandkit/MCT-black.svg';
	import sbLogoBlue from '$lib/img/brandkit/SB-blue.svg';
	import sbLogoBlack from '$lib/img/brandkit/SB-black.svg';
	import sicLogoBlue from '$lib/img/brandkit/SIC-blue.svg';
	import sicLogoBlack from '$lib/img/brandkit/SIC-black.svg';
	import zfLogoLight from '$lib/img/brandkit/zwemfed-lightmode.svg';
	import zfLogoDark from '$lib/img/brandkit/zwemfed-darkmode.svg';

	let { data } = $props<{ data: PageData }>();
	let formError: string | null = $state(null);

	// Profile settings
	let bio = $state(data.coach.bio || '');
	let specialties = $state(data.coach.specialties?.join(', ') || '');

	// Keep track of theme locally to prevent flashing
	let currentTheme = $state($userSettings.theme);
	let isDarkMode = $state(false);

	// Initialize theme on mount
	onMount(() => {
		if (browser) {
			document.documentElement.classList.toggle('dark', currentTheme === 'DARK');
		}

		const savedDarkMode = localStorage.getItem('darkMode') === 'true';
		isDarkMode = savedDarkMode;
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

	$effect(() => {
		const darkModeObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.target instanceof HTMLElement) {
					isDarkMode = mutation.target.classList.contains('dark');
				}
			});
		});

		darkModeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => darkModeObserver.disconnect();
	});
</script>

<div class="mx-auto space-y-6">
	<h1 class="text-3xl font-bold mb-8">{m.settings()}</h1>
	<!-- Profile Settings -->
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
					<Icon src={$userSettings.theme === 'DARK' ? Sun : Moon} class="h-5 w-5" />
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
						<Select.Item value="en">
							<div class="flex items-center">
								<span>English</span>
							</div>
						</Select.Item>
						<Select.Item value="nl">
							<div class="flex items-center">
								<span>Nederlands</span>
							</div>
						</Select.Item>
						<Select.Item value="fr">
							<div class="flex items-center">
								<span>Français</span>
							</div>
						</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>

	<!-- Branding -->
	<div class="pt-8 px-4 flex justify-center">
		<div class="u-brandgrid">
			<a href={"https://www.zwemfed.be"}>
				<img src={isDarkMode ? zfLogoDark : zfLogoLight} alt={"Zwemfed"} />
			</a>
			<a href={"https://www.sportinnovatiecampus.be"}>
				<img src={sicLogoBlue} alt={"Sportinnovatiecampus"} />
			</a>
			<a href={"https://www.howest.be/nl/opleidingen/bachelor/sport-en-bewegen"}>
				<img src={sbLogoBlue} alt={"Howest | Sport & Bewegen"} />
			</a>
			<a href={"https://mct.be"}>
				<img src={mctLogoBlue} alt={"Howest | Multimedia & Creative Technologies"} />
			</a>
		</div>
	</div>
</div>

<style>
.u-brandgrid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: repeat (2, auto);
	column-gap: 1.5rem;
	row-gap: 2rem;
	justify-items: center;
	align-items: center;
	max-width: 800px;

	@media (width > 425px) {
		max-height: 80px;
		grid-template-columns: repeat(4, 1fr);
		column-gap: 2rem;
	}

	@media (width > 768px) {
		column-gap: 3.6rem;
	}
}
</style>