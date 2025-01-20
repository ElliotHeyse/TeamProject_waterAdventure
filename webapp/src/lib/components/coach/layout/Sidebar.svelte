<script lang="ts">
	import { page } from '$app/state';
	import {
		ChartBar,
		AcademicCap,
		UserGroup,
		ClipboardDocumentCheck,
		ChatBubbleLeftRight,
		Cog6Tooth,
		Icon,
		UserCircle
	} from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import logo from '$lib/img/logo-dark.svg';
	import logoLight from '$lib/img/logo-light.svg';
	import logoIcon from '$lib/img/logo-icon.svg';
	import * as m from '$lib/paraglide/messages.js';

	let { isSidebarOpen } = $props<{ isSidebarOpen: boolean }>();
	let isDarkMode = $state(false);

	onMount(() => {
		const savedDarkMode = localStorage.getItem('darkMode') === 'true';
		isDarkMode = savedDarkMode;
	});

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

	const navItems = [
		{ href: '/coach', label: m.nav_overview(), icon: ChartBar },
		{ href: '/coach/lessons', label: m.nav_lessons(), icon: AcademicCap },
		{ href: '/coach/pupils', label: m.nav_pupils(), icon: UserGroup },
		{ href: '/coach/parents', label: m.parents(), icon: UserGroup },
		{ href: '/coach/submissions', label: m.nav_submissions(), icon: ClipboardDocumentCheck },
		{ href: '/coach/chat', label: m.nav_chat(), icon: ChatBubbleLeftRight },
		{ href: '/coach/settings', label: m.nav_settings(), icon: Cog6Tooth }
	];
</script>

<aside
	class="border-border bg-background/50 supports-[backdrop-filter]:bg-background/80 sticky top-0 flex h-screen flex-col border-r shadow-sm backdrop-blur transition-all duration-300"
	class:w-64={isSidebarOpen}
	class:w-16={!isSidebarOpen}
>
	<div class="border-border flex h-16 items-center justify-between border-b px-4">
		{#if isSidebarOpen}
			<img src={isDarkMode ? logoLight : logo} alt="SwimCoach" class="h-8" />
		{:else}
			<div class="mx-auto">
				<img src={logoIcon} alt="SwimCoach" class="h-6" />
			</div>
		{/if}
	</div>

	<nav class="flex-1 overflow-y-auto px-2 py-3">
		<ul class="space-y-1">
			{#each navItems as { href, label, icon }}
				{@const currentPath = page.url.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')}
				{@const isActive =
					(currentPath.startsWith(href) && href !== '/coach') ||
					(href === '/coach' && currentPath === '/coach')}
				<li>
					<a
						{href}
						class={{
							'text-muted-foreground group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150': true,
							'bg-primary/10 text-primary': isActive
						}}
					>
						<div
							class="muted-foreground shrink-0 transition-colors"
							class:text-primary={isActive}
							class:group-hover:text-foreground={!isActive}
						>
							<Icon src={icon} class="h-5 w-5" />
						</div>
						{#if isSidebarOpen}
							<span class="truncate">{label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="border-border mt-auto border-t px-3 py-3">
		{#if isSidebarOpen}
			<div class="bg-muted/80 flex items-center gap-3 rounded-lg px-3 py-2.5">
				<div class="bg-primary/10 text-primary h-8 w-8 rounded-full">
					<Icon src={UserCircle} class="h-8 w-8" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="text-foreground truncate text-sm font-medium">John Doe</div>
					<div class="text-muted-foreground truncate text-xs">{m.swimming_coach()}</div>
				</div>
			</div>
		{:else}
			<div class="flex justify-center">
				<div class="bg-primary/10 text-primary h-8 w-8 rounded-full">
					<Icon src={UserCircle} class="h-8 w-8" />
				</div>
			</div>
		{/if}
	</div>
</aside>
