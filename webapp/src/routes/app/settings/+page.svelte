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
	import { CircleAlert, LogOut } from 'lucide-svelte';
	import { isMobileView } from '$lib/stores/viewport';
	import { cn } from '$lib/components/coach/utils';

	// Branding
	import mctLogoBlue from '$lib/img/brandkit/MCT-blue.svg';
	import mctLogoBlack from '$lib/img/brandkit/MCT-black.svg';
	import sbLogoBlue from '$lib/img/brandkit/SB-blue.svg';
	import sbLogoBlack from '$lib/img/brandkit/SB-black.svg';
	import sicLogoBlue from '$lib/img/brandkit/SIC-blue.svg';
	import sicLogoBlack from '$lib/img/brandkit/SIC-black.svg';
	import zfLogoLight from '$lib/img/brandkit/zwemfed-lightmode.svg';
	import zfLogoDark from '$lib/img/brandkit/zwemfed-darkmode.svg';

	// Logic
	const { data } = $props<{ data: PageData }>();
	let formError: string | null = $state(null);

	// Profile settings
	let phone = $state(data?.parent?.phone || '');

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

	async function handleLogout() {
		await goto('/logout');
	}
</script>

<div class="px-4 pb-14">
	<div class="mx-auto">
		<!-- <h1 class="fz-ms5 font-sniglet-regular">{m.settings()}</h1> -->

		<!-- Profile Settings -->
		<div class="mt-4 bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class={cn("flex justify-between items-start gap-2 p-4",
				$userSettings.theme === 'DARK' ? "bg-gray-500 bg-opacity-10" : "bg-gray-50"
			)}>
				<div class="flex flex-col gap-1">
					<h3 class="fz-ms4 font-semibold leading-none">{m.profile_settings()}</h3>
					<p class="fz-ms2 text-muted-foreground">{m.manage_personal_info()}</p>
				</div>
				<Button class={cn("flex items-center p-3 h-auto !ring-0 focus:border-blue-500 flex-shrink-0 focus:text-blue-600",
					$userSettings.theme === 'DARK' ? "hover:bg-gray-500 hover:bg-opacity-10 focus:bg-gray-500 focus:bg-opacity-10" : "hover:bg-blue-50 focus:bg-blue-50"
				)}
				variant="outline" onclick={handleLogout}>
					<LogOut class="w-5 h-5 m-auto" />
					<span class="max-[374px]:fz-ms1 hidden min-[320px]:block min-[375px]:fz-ms2 min-[425px]:text-[1rem]">Log out</span>
				</Button>
			</div>
			<Separator />
			<form method="POST" action="?/updateProfile" class="p-4 flex flex-col gap-4" onsubmit={handleSubmit}>
				{#if formError}
					<div class="alert-wrapper">
						<Alert variant="destructive">
							<CircleAlert class="h-4 w-4" />
							<AlertTitle>{m.error()}</AlertTitle>
							<AlertDescription>{formError}</AlertDescription>
						</Alert>
					</div>
				{/if}

				<div class="space-y-1">
					<Label class="text-[0.75rem] min-[425px]:text-[0.875rem]" for="name">{m.name()}</Label>
					<Input class={cn("text-[0.875rem] !ring-0 ",
						$userSettings.theme === 'DARK' ? "hover:bg-gray-500 bg-opacity-5" : "hover:bg-gray-50 focus:border-blue-500 focus:bg-blue-50"
					)} id="name" value={data.parent.user.name} disabled />
				</div>
				<div class="space-y-1">
					<Label class="text-[0.75rem] min-[425px]:text-[0.875rem]" for="email">{m.email()}</Label>
					<Input class={cn("text-[0.875rem] !ring-0 ",
						$userSettings.theme === 'DARK' ? "hover:bg-gray-500 bg-opacity-5" : "hover:bg-gray-50 focus:border-blue-500 focus:bg-blue-50"
					)} id="email" type="email" value={data.parent.user.email} disabled />
				</div>
				<div class="space-y-1">
					<Label class="text-[0.75rem] min-[425px]:text-[0.875rem]" for="phone">{m.phone()}</Label>
					<Input class={cn("text-[0.875rem] !ring-0 focus:border-blue-500",
						$userSettings.theme === 'DARK' ? "hover:bg-blue-950 hover:bg-opacity-50 focus:bg-blue-950" : "hover:bg-blue-50 focus:bg-blue-50"
					)}
						type="tel"
						id="phone"
						name="phone"
						bind:value={phone}
						placeholder="telefoonnummer"
					/>
				</div>
				<div class="flex justify-end">
					<Button class={cn("text-[0.875rem] !ring-0 border-2 border-opacity-0 focus:drop-shadow-lg text-blue-50",
						$userSettings.theme === 'DARK' ? "bg-blue-800 hover:bg-blue-700 focus:bg-blue-950 focus:border-opacity-100 focus:border-blue-500 focus:text-blue-500" : "bg-blue-500 hover:bg-blue-600 focus:bg-blue-200 focus:border-opacity-100 focus:border-blue-500 focus:text-blue-500"
					)}
					type="submit">{m.save_profile()}</Button>
				</div>
			</form>
		</div>

		<!-- Appearance Settings -->
		<div class="mt-4 bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class={cn("flex flex-col gap-1 p-4 bg-gray-50",
				$userSettings.theme === 'DARK' ? "bg-gray-500 bg-opacity-10" : "bg-gray-50"
			)}>
				<h3 class="fz-ms4 font-semibold leading-none">{m.appearance()}</h3>
				<!-- <p class="fz-ms2 text-muted-foreground">{m.customize_appearance()}</p> -->
			</div>
			<Separator />
			<div class="p-4">
				<div class="flex items-center justify-between gap-2">
					<div class="space-y-0.5">
						<Label class="text-[0.875rem]">{m.dark_mode()}</Label>
						<div class="fz-ms1 min-[425px]:fz-ms2 text-muted-foreground">
							{m.dark_mode_description()}
						</div>
					</div>
					<Button class={cn("!ring-0 focus:border-blue-500 flex-shrink-0 focus:text-blue-600",
						$userSettings.theme === 'DARK' ? "hover:bg-gray-500 hover:bg-opacity-10 focus:bg-gray-500 focus:bg-opacity-10" : "hover:bg-blue-50 focus:bg-blue-50"
					)}
					variant="outline" size="icon" onclick={toggleDarkMode}>
						<Icon src={currentTheme === 'DARK' ? Sun : Moon} class="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>

		<!-- Notification Settings -->
		<div class="mt-4 bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class={cn("flex flex-col gap-1 p-4 bg-gray-50",
				$userSettings.theme === 'DARK' ? "bg-gray-500 bg-opacity-10" : "bg-gray-50"
			)}>
				<h3 class="fz-ms4 font-semibold leading-none">{m.notifications()}</h3>
				<!-- <p class="fz-ms2 text-muted-foreground">{m.manage_notifications()}</p> -->
			</div>
			<Separator />
			<div class="p-4 space-y-4">
				<div class="flex items-center justify-between gap-4">
					<div class="space-y-0.5">
						<div class="flex items-center gap-2">
							<Label class="text-[0.875rem]">{m.email_notifications()}</Label>
							<Badge variant="secondary" class="text-xs">Soon</Badge>
						</div>
						<div class="fz-ms1 min-[425px]:fz-ms2 text-muted-foreground">
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
				<div class="flex items-center justify-between gap-4">
					<div class="space-y-0.5">
						<div class="flex items-center gap-2">
							<Label class="text-[0.875rem]">{m.push_notifications()}</Label>
							<Badge variant="secondary" class="text-xs">Soon</Badge>
						</div>
						<div class="fz-ms1 min-[425px]:fz-ms2 text-muted-foreground">
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
		<div class="mt-4 bg-card text-card-foreground rounded-lg border shadow-sm">
			<div class={cn("flex flex-col gap-1 p-4 bg-gray-50",
				$userSettings.theme === 'DARK' ? "bg-gray-500 bg-opacity-10" : "bg-gray-50"
			)}>
				<h3 class="fz-ms4 font-semibold leading-none">{m.account_settings()}</h3>
				<!-- <p class="fz-ms2 text-muted-foreground">{m.manage_account()}</p> -->
			</div>
			<Separator />
			<div class="p-4 flex flex-col gap-4">
					<Label class="text-[0.75rem] min-[425px]:text-[0.875rem]">{m.language()}</Label>
					<Select.Root
						type="single"
						value={$userSettings.language}
						onValueChange={(value: string) => handleLanguageChange(value as AvailableLanguageTag)}
					>
						<Select.Trigger class={cn("w-[180px] !ring-0focus:border-blue-500 focus:text-blue-500",
							$userSettings.theme === 'DARK' ? "hover:bg-gray-500 hover:bg-opacity-10 focus:bg-gray-500 focus:bg-opacity-10" : "hover:bg-blue-50 focus:bg-blue-50"
						)}>
							<div class="flex items-center">
								{#if $userSettings.language === 'en'}
									<span class="fz-ms2">English</span>
								{:else if $userSettings.language === 'nl'}
									<span class="fz-ms2">Nederlands</span>
								{:else}
									<span class="fz-ms2">Français</span>
								{/if}
							</div>
						</Select.Trigger>
						<Select.Content>
							<Select.Item class="text-[0.875rem]" value="en">English</Select.Item>
							<Select.Item class="text-[0.875rem]" value="nl">Nederlands</Select.Item>
							<Select.Item class="text-[0.875rem]" value="fr">Français</Select.Item>
						</Select.Content>
					</Select.Root>
			</div>
		</div>

		<!-- Branding -->
		<div class={cn("pt-8 px-4 flex justify-center",
			$isMobileView ? "mb-6" : "-mb-6"
		)}>
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
		max-width: min(100%, 288px);

		@media (width > 576px) {
			max-height: 80px;
			grid-template-columns: repeat(4, 1fr);
			column-gap: 2rem;
			max-width: 800px;
		}

		@media (width > 768px) {
			column-gap: 3.6rem;
			max-width: 800px;
		}
	}
</style>