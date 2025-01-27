<script lang="ts">
	import logo from '$lib/img/logo-dark.svg';
	import logoLight from '$lib/img/logo-light.svg';
	import { page } from '$app/state';
	import {
		Bell,
		ChevronRight,
		ChevronLeft,
		Sun,
		Moon,
		Menu,
		ChevronDown,
		Settings,
		LogOut
	} from 'lucide-svelte';
	import * as Breadcrumb from '$lib/components/coach/ui/breadcrumb';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/components/coach/utils';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import { isMobileView } from '$lib/stores/viewport';
	import { userSettings } from '$lib/stores/userSettings';
	import { invalidateAll, goto } from '$app/navigation';
	import { selectedChildIdStore } from '$lib/stores/child.store';
	import { getGravatarUrl } from '$lib/utils/gravatar';

	// region Types

	interface Pupil {
		id: string;
		name: string;
		progress: Number;
		profilePicture: number;
	}
	interface UserNotification {
		timestamp: Date;
		isRead: Boolean;
		type: string;
		title: string;
		body: string;
		levelNumber: Number;
	}
	interface ParentUser {
		id: string;
		email: string;
		name: string;
		parent: {
			id: string;
			phone: string;
			coachId: string;
			pupils: Pupil[];
		};
		settings: {
			pushNotifications: Boolean;
			emailNotifications: Boolean;
			theme: string;
			language: string;
		};
		notifications: UserNotification[];
	}
	interface LanguageContent {
		language: string;
		title: string;
		objectives: string[];
	}
	interface Level {
		duration: Number;
		levelNumber: Number;
		languageContents: LanguageContent[];
	}

	interface Notification {
		id: number;
		message: string;
		timestamp: string;
	}

	let notifications = $state<Notification[]>([]);

	// region Logic

	// Generate breadcrumb items based on current path
	$effect(() => {
		const path = page.url.pathname;
		const segments = path.split('/').filter(Boolean);
		breadcrumbs = segments
			.map((segment, index) => ({
				label: segment.charAt(0).toUpperCase() + segment.slice(1),
				href: '/' + segments.slice(0, index + 1).join('/')
			}))
			.filter((breadcrumb) => !['nl', 'fr', 'en'].includes(breadcrumb.label.toLowerCase()));
	});

	let breadcrumbs = $state<Array<{ label: string; href: string }>>([]);

	// configure Light/dark mode
	async function toggleDarkMode() {
		const newMode = $userSettings.theme === 'LIGHT' ? 'DARK' : 'LIGHT';
		await userSettings.updateSettings({ theme: newMode });
	}

	// Get children from the current page data
	const data = $state(page.data);

	let children = $state<Pupil[]>([]);
	let selectedChildId = $state($selectedChildIdStore);
	let selectedChild = $state<Pupil | null>(null);

	// Update children and selected child when data changes
	$effect(() => {
		children = data?.parentUser?.parent?.pupils || [];
		selectedChild = children.find((child) => child.id === selectedChildId) || children[0] || null;
	});

	// Check if we're on a specific level page (numbers 1-7)
	const isLevelPage = $derived(() => {
		const path = page.url.pathname;
		// Match only numbered level pages, accounting for optional language prefix
		const levelPattern = /^(?:\/(?:nl|fr))?\/app\/levels\/\d+$/;
		return levelPattern.test(path);
	});

	async function handleChildSelect(childId: string) {
		selectedChildIdStore.set(childId);
		selectedChild = children.find((child) => child.id === childId) || children[0] || null;

		invalidateAll();
	}

	async function handleLogout() {
		const response = await fetch('/api/auth/logout', {
			method: 'POST'
		});
		if (response.ok) {
			goto('/');
		}
	}
</script>

<header
	class="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 border-b backdrop-blur z-50"
>
	<div class="h-16">
		<div class="flex items-center justify-between h-full gap-4 px-4">
			<div class={cn($isMobileView ? 'block' : 'hidden')}>
				<img
					src={$userSettings.theme === 'DARK' ? logoLight : logo}
					alt="WaterAdventure"
					class="h-8"
				/>
			</div>

			<!-- <div class={cn("flex items-center flex-nowrap gap-4", $isMobileView ? 'hidden' : 'block')}> -->
			<div class="flex items-center gap-4 {isMobileView ? 'block' : 'hidden'}">
				<!-- <div class="flex items-center gap-4"> -->
				<!-- collapse/show sidebar button -->
				<button
					class={cn(
						'text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2',
						$isMobileView ? 'hidden' : 'block'
					)}
					onclick={() => isSidebarOpen.update((open) => !open)}
				>
					{#if $isSidebarOpen}
						<ChevronLeft class="w-5 h-5" />
					{:else}
						<Menu class="w-5 h-5" />
					{/if}
				</button>

				<nav class={cn('flex', $isMobileView ? 'hidden' : 'block')} aria-label="Breadcrumb">
					<Breadcrumb.Root>
						<Breadcrumb.List>
							{#each breadcrumbs as { label, href }, i}
								<Breadcrumb.Item>
									{#if i === breadcrumbs.length - 1}
										<Breadcrumb.Page>{label}</Breadcrumb.Page>
									{:else}
										<Breadcrumb.Link {href}>{label}</Breadcrumb.Link>
										<Breadcrumb.Separator />
									{/if}
								</Breadcrumb.Item>
							{/each}
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</nav>
			</div>

			<div class="flex items-center gap-4">
				<!-- Child selector dropdown -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger disabled={isLevelPage()}>
						<Button
							variant="ghost"
							size="sm"
							class={cn(
								'flex items-center gap-2 px-3 h-8 border',
								isLevelPage() && 'opacity-50 cursor-not-allowed'
							)}
						>
							<div class="bg-primary/10 text-primary h-5 w-5 rounded-full overflow-hidden">
								<img
									src={`/src/lib/img/profile-pictures/profile${selectedChild?.profilePicture}.svg`}
									alt={`${selectedChild?.name}'s profile picture`}
									class="h-full w-full object-cover"
								/>
							</div>
							<span class="text-sm font-medium">{selectedChild?.name || 'Select child'}</span>
							<ChevronDown class="w-4 h-4" />
						</Button>
					</DropdownMenu.Trigger>
					{#if !isLevelPage()}
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Label>Children</DropdownMenu.Label>
							<DropdownMenu.Separator />
							{#each children as child}
								<DropdownMenu.Item
									onclick={() => handleChildSelect(child.id)}
									class="flex items-center gap-2"
								>
									<div class="bg-primary/10 text-primary h-8 w-8 rounded-full overflow-hidden">
										<img
											src={`/src/lib/img/profile-pictures/profile${child.profilePicture}.svg`}
											alt={`${child.name}'s profile picture`}
											class="h-full w-full object-cover"
										/>
									</div>
									{child.name}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					{/if}
				</DropdownMenu.Root>

				<!-- toggle dark mode button -->
				<button
					class={cn(
						'text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2',
						$isMobileView ? 'hidden' : 'block'
					)}
					onclick={toggleDarkMode}
				>
					{#if $userSettings.theme === 'DARK'}
						<Sun class="w-5 h-5" />
					{:else}
						<Moon class="w-5 h-5" />
					{/if}
				</button>

				<!-- toggle notifications button -->
				<button
					class={cn(
						'text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2',
						$isMobileView ? 'hidden' : 'block'
					)}
				>
					<Bell class="w-5 h-5 text-muted-foreground" />
					{#if notifications.length > 0}
						<span
							class="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs rounded-full bg-destructive text-destructive-foreground"
						>
							{notifications.length}
						</span>
					{/if}
				</button>

				<!-- User profile dropdown -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="flex items-center gap-2">
						<div class="bg-primary/10 text-primary h-8 w-8 rounded-full overflow-hidden">
							<img
								src={getGravatarUrl(data.parentUser.email, 32)}
								alt={`${data.parentUser.name}'s profile picture`}
								class="h-full w-full object-cover"
							/>
						</div>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onSelect={() => goto('/app/settings')} class="cursor-pointer">
							<Settings class="mr-2 h-4 w-4" />
							<span>Settings</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item onSelect={handleLogout} class="cursor-pointer">
							<LogOut class="mr-2 h-4 w-4" />
							<span>Log out</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</div>
</header>
