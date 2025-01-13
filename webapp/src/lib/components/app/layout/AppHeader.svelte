<script lang="ts">
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
			<button
				class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2"
				onclick={() => isSidebarOpen.update(open => !open)}
			>
				{#if $isSidebarOpen}
					<Menu class="h-5 w-5" />
				{:else}
					<ChevronRight class="h-5 w-5" />
				{/if}
			</button>

			<nav class="flex" aria-label="Breadcrumb">
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
					class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2"
					onclick={toggleDarkMode}
				>
					{#if isDarkMode}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</button>

				<button class="hover:bg-muted relative rounded-full p-2">
					<Bell class="text-muted-foreground h-5 w-5" />
					{#if notifications.length > 0}
						<span
							class="bg-destructive text-destructive-foreground absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs"
						>
							{notifications.length}
						</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
</header> 