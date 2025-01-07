<script lang="ts">
	import { page } from '$app/state';
	import { BellAlert, UserCircle, Bars3, ChevronRight, Icon, Sun, Moon } from 'svelte-hero-icons';
	import { onMount } from 'svelte';

	interface User {
		name: string;
		avatar: string;
	}

	interface Notification {
		id: number;
		message: string;
		timestamp: string;
	}

	let { isSidebarOpen = $bindable<boolean>() } = $props<{ isSidebarOpen: boolean }>();
	let isDarkMode = $state(false);

	let user = $state<User>({
		name: 'John Doe',
		avatar: ''
	});

	let notifications = $state<Notification[]>([]);

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
				onclick={() => (isSidebarOpen = !isSidebarOpen)}
			>
				<Icon src={isSidebarOpen ? Bars3 : ChevronRight} class="h-5 w-5" />
			</button>

			<nav class="flex" aria-label="Breadcrumb">
				<ol class="flex items-center space-x-2">
					{#each breadcrumbs as { label, href }, i}
						<li>
							<div class="flex items-center">
								{#if i !== 0}
									<Icon src={ChevronRight} class="text-muted-foreground mx-2 h-4 w-4" />
								{/if}
								<a {href} class="text-muted-foreground hover:text-foreground text-sm font-medium">
									{label}
								</a>
							</div>
						</li>
					{/each}
				</ol>
			</nav>

			<div class="ml-auto flex items-center space-x-4">
				<button
					class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2"
					onclick={toggleDarkMode}
				>
					<Icon src={isDarkMode ? Sun : Moon} class="h-5 w-5" />
				</button>

				<button class="hover:bg-muted relative rounded-full p-2">
					<Icon src={BellAlert} class="text-muted-foreground h-5 w-5" />
					{#if notifications.length > 0}
						<span
							class="bg-destructive text-destructive-foreground absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs"
						>
							{notifications.length}
						</span>
					{/if}
				</button>

				<div class="flex items-center space-x-3">
					<Icon src={UserCircle} class="text-muted-foreground h-5 w-5" />
					<span class="text-foreground font-medium">{user.name}</span>
				</div>
			</div>
		</div>
	</div>
</header>
