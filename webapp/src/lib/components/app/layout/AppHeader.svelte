<script lang="ts">
	import logo from '$lib/img/logo-dark.svg';
	import logoLight from '$lib/img/logo-light.svg';
	import { page } from '$app/state';
	import { Bell, ChevronRight, Sun, Moon, Menu, ChevronDown } from 'lucide-svelte';
	import * as Breadcrumb from '$lib/components/coach/ui/breadcrumb';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/components/coach/utils';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import { isMobileView } from '$lib/stores/viewport';
	import { userSettings } from '$lib/stores/userSettings';
	import { invalidateAll } from '$app/navigation';
	import { selectedChildIdStore } from '$lib/stores/child.store';

	// region Types

	interface Pupil {
		id: string,
		name: string,
		progress: Number
	}
	interface UserNotification {
		timestamp: Date,
		isRead: Boolean,
		type: string,
		title: string,
		body: string,
		levelNumber: Number
	}
	interface ParentUser {
  		id: string,
  		email: string,
  		name: string,
  		parent: {
			id: string,
			phone: string,
			coachId: string,
			pupils: Pupil[]
  		},
  		settings: {
			pushNotifications: Boolean,
			emailNotifications: Boolean,
			theme: string,
			language: string
  		},
  		notifications: UserNotification[]
	}
	interface LanguageContent {
		language: string,
		title: string,
		objectives: string[]
	}
	interface Level {
		duration: Number,
		levelNumber: Number,
		languageContents: LanguageContent[]
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
		breadcrumbs = segments.map((segment, index) => ({
			label: segment.charAt(0).toUpperCase() + segment.slice(1),
			href: '/' + segments.slice(0, index + 1).join('/')
		}));
	});

	let breadcrumbs = $state<Array<{ label: string; href: string }>>([]);

	// configure Light/dark mode
	async function toggleDarkMode() {
		const newMode = $userSettings.theme === 'LIGHT' ? 'DARK' : 'LIGHT';
		await userSettings.updateSettings({ theme: newMode });
	}

	// Get children from the current page data
	const data = $state(page.data);
	const children = $state<Pupil[]>(data.parentUser.parent.pupils);
	let selectedChildId = $state($selectedChildIdStore);
	let selectedChild = $state(
		children.find((child) => child.id === selectedChildId) || children[0] || null
	);

	async function handleChildSelect(childId: string) {
		selectedChildIdStore.set(childId);
		selectedChild = children.find((child) => child.id === childId) || children[0] || null;

		invalidateAll();
	}
</script>

<header
	class="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur"
>
	<div class="h-16">
		<div class="flex justify-between items-center gap-4 h-full px-4">
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
						<Menu class="h-5 w-5" />
					{:else}
						<ChevronRight class="h-5 w-5" />
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
				<!-- toggle dark mode button -->
				<button
				class={cn(
					'text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2',
					$isMobileView ? 'hidden' : 'block'
				)}
				onclick={toggleDarkMode}
				>
					{#if $userSettings.theme === 'DARK'}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</button>

				<!-- toggle notifications button -->
				<button
				class={cn(
					'text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2',
					$isMobileView ? 'hidden' : 'block'
				)}
				>
					<Bell class="text-muted-foreground h-5 w-5" />
					{#if notifications.length > 0}
						<span
							class="bg-destructive text-destructive-foreground absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs"
						>
							{notifications.length}
						</span>
					{/if}
				</button>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="ghost" size="sm" class="flex items-center gap-2 px-3 h-8 border">
							<span class="text-sm font-medium">{selectedChild?.name || 'Select child'}</span>
							<ChevronDown class="h-4 w-4" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Label>Children</DropdownMenu.Label>
						<DropdownMenu.Separator />
						{#each children as child}
							<DropdownMenu.Item onclick={() => handleChildSelect(child.id)}>
								{child.name}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</div>
</header>
