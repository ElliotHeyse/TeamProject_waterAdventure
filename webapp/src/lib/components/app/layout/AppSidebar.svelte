<script lang="ts">
	// new
	import { isMobileView } from "$lib/stores/viewport";

	// old
	import { page } from "$app/stores";
	import { Button } from "$lib/components/coach/ui/button";
	import { cn } from "$lib/components/coach/utils";
	import {
		Home,
		User,
		Trophy,
		MessageSquare,
		Settings
	} from "lucide-svelte";
	import * as m from "$lib/paraglide/messages";
	import { onMount } from 'svelte';
	import logo from '$lib/img/logo-dark.svg';
	import logoLight from '$lib/img/logo-light.svg';
	import logoIcon from '$lib/img/logo-icon.svg';
	import { isSidebarOpen } from '$lib/stores/sidebar';

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
		{ href: "/app", icon: Home, label: "Overview" },
		{ href: "/app/profile", icon: User, label: "Profile" },
		{ href: "/app/levels", icon: Trophy, label: "Levels" },
		{ href: "/app/chat", icon: MessageSquare, label: "Chat" },
		{ href: "/app/settings", icon: Settings, label: "Settings" }
	];
</script>

<aside class={cn("border-border bg-background/50 flex supports-[backdrop-filter]:bg-background/80 shadow-sm backdrop-blur transition-all duration-300",
	$isMobileView
		? "border-t flex-grow-0"
		: `sticky top-0 h-screen border-r flex-col ${$isSidebarOpen ? "w-64" : "w-16"}`
)}>
	<div class={cn("border-border flex h-16 items-center justify-between border-b px-4",
		$isMobileView ? "hidden" : ""
	)}>
		{#if $isSidebarOpen}
			<img src={isDarkMode ? logoLight : logo} alt="WaterAdventure" class="h-8" />
		{:else}
			<div class="mx-auto">
				<img src={logoIcon} alt="WaterAdventure" class="h-6" />
			</div>
		{/if}
	</div>

	<nav class={cn("flex-1 space-y-1 p-2",
		$isMobileView ? "flex justify-evenly" : ""
	)}>
		{#each navItems as { href, icon: Icon, label }}
			{@const isActive = $page.url.pathname === href ||
				($page.url.pathname.startsWith(href) && href !== "/app")}
			<Button
				variant={isActive ? "secondary" : "ghost"}
				{href}
				class={cn(
					$isMobileView
						? "mobile style"
						: `w-full justify-start ${$isSidebarOpen ? "" : "justify-center px-2"}`
				)}
			>
				<Icon class={cn(
					"h-5 w-5",
					isActive ? "text-primary" : "text-muted-foreground"
				)} />
				{#if !$isMobileView && $isSidebarOpen}
					<span class="ml-2">{label}</span>
				{/if}
			</Button>
		{/each}
	</nav>
</aside>