<script lang="ts">
	// new
	import logo from '$lib/img/logo-dark.svg';
	import logoLight from '$lib/img/logo-light.svg';
	
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import { Button } from '$lib/components/coach/ui/button';
	import { ChevronDown } from 'lucide-svelte';
	
	let dropdownIsOpen = $state(false);
	let selectedOption = $state("Option 1");

	// old
	import { page } from '$app/stores';
	import { Bell, ChevronRight, Sun, Moon, Menu } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import * as Breadcrumb from '$lib/components/coach/ui/breadcrumb';
	import { isSidebarOpen } from '$lib/stores/sidebar';

	interface Notification {
		id: number;
		message: string;
		timestamp: string;
	}

	let isDarkMode = $state(false);
	let notifications = $state<Notification[]>([]);

	// Generate breadcrumb items based on current path
	$effect(() => {
		const path = $page.url.pathname;
		const segments = path.split('/').filter(Boolean);
		breadcrumbs = segments.map((segment, index) => ({
			label: segment.charAt(0).toUpperCase() + segment.slice(1),
			href: '/' + segments.slice(0, index + 1).join('/')
		}));
	});

	let breadcrumbs = $state<Array<{ label: string; href: string }>>([]);

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		document.documentElement.classList.toggle('dark', isDarkMode);
		localStorage.setItem('darkMode', isDarkMode.toString());
	}

	onMount(() => {
		const savedDarkMode = localStorage.getItem('darkMode') === 'true';
		isDarkMode = savedDarkMode;
		document.documentElement.classList.toggle('dark', savedDarkMode);
	});
</script>

<header
	class="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur"
>
	<div class="h-16">
		<div class="flex h-full items-center gap-4 px-4">
			<div class="u-hide-desktop">
				<img src={isDarkMode ? logoLight : logo} alt="WaterAdventure" class="h-8" />
			</div>

			<button
				class="u-hide-mobile text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2"
				onclick={() => isSidebarOpen.update(open => !open)}
			>
				{#if $isSidebarOpen}
					<Menu class="h-5 w-5" />
				{:else}
					<ChevronRight class="h-5 w-5" />
				{/if}
			</button>

			<nav class="u-hide-mobile flex" aria-label="Breadcrumb">
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

			<div class="ml-auto flex items-center space-x-4">
				<button
					class="u-hide-mobile text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2"
					onclick={toggleDarkMode}
				>
					{#if isDarkMode}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</button>

				<button class="u-hide-mobile hover:bg-muted relative rounded-full p-2">
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
					<DropdownMenu.Trigger asChild>
						<Button variant="ghost" size="sm" class="flex items-center gap-2 px-3 h-8">
							<span class="text-sm font-medium">{selectedOption}</span>
							<ChevronDown class="h-4 w-4 opacity-50"/>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Label>Options</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.RadioGroup value={selectedOption}>
							<DropdownMenu.RadioItem value="Option 1">Option 1</DropdownMenu.RadioItem>
							<DropdownMenu.RadioItem value="Option 2">Option 2</DropdownMenu.RadioItem>
							<DropdownMenu.RadioItem value="Option 3">Option 3</DropdownMenu.RadioItem>
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</div>
</header>

<style>

	.u-hide-desktop {
		display: none;
	}

	.u-hide {
		display: none;
	}

	@media screen and (max-width: 576px) {
		.u-hide-mobile {
			display: none;
		}

		.u-hide-desktop {
			display: block;
		}
    }
</style>