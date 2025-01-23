<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/components/coach/utils';
	import {
		HomeModern,
		UserCircle,
		AcademicCap,
		ChatBubbleLeftRight,
		Cog6Tooth,
		ArrowRightOnRectangle,
		Icon
	} from 'svelte-hero-icons';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	import logo from '$lib/img/logo-dark.svg';
	import logoLight from '$lib/img/logo-light.svg';
	import logoIcon from '$lib/img/logo-icon.svg';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import { isMobileView } from '$lib/stores/viewport';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import { goto } from '$app/navigation';

	let isDarkMode = $state(false);

	const data = $state(page.data);
	const parentName = $state(data.parent?.user?.name || 'Unknown Parent');

	async function handleLogout() {
		await goto('/logout');
	}

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
		{ href: '/app', icon: HomeModern, label: 'Overview' },
		{ href: '/app/levels', icon: AcademicCap, label: 'Levels' },
		{ href: '/app/chat', icon: ChatBubbleLeftRight, label: 'Chat' },
		{ href: '/app/settings', icon: Cog6Tooth, label: 'Settings' }
	];
</script>

<aside
	class="border-border bg-background/50 supports-[backdrop-filter]:bg-background/80 sticky top-0 flex h-screen flex-col border-r shadow-sm backdrop-blur transition-all duration-300"
	class:w-64={$isSidebarOpen}
	class:w-16={!$isSidebarOpen}
>
	<div class="border-border flex h-16 items-center justify-between border-b px-4">
		{#if $isSidebarOpen}
			<img src={isDarkMode ? logoLight : logo} alt="WaterAdventure" class="h-8" />
		{:else}
			<div class="mx-auto">
				<img src={logoIcon} alt="WaterAdventure" class="h-6" />
			</div>
		{/if}
	</div>

	<nav class="flex-1 overflow-y-auto px-2 py-3">
		<ul class="space-y-1">
			{#each navItems as { href, icon, label }}
				{@const currentPath = page.url.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')}
				{@const isActive =
					(currentPath.startsWith(href) && href !== '/app') ||
					(href === '/app' && currentPath === '/app')}
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
						{#if $isSidebarOpen}
							<span class="truncate">{label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="border-border mt-auto border-t px-3 py-3">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="w-full">
				{#if $isSidebarOpen}
					<div class="bg-muted/80 flex items-center gap-3 rounded-lg px-3 py-2.5">
						<div class="bg-primary/10 text-primary h-8 w-8 rounded-full">
							<Icon src={UserCircle} class="h-8 w-8" />
						</div>
						<div class="min-w-0 flex-1">
							<div class="text-foreground truncate text-sm font-medium">{parentName}</div>
							<div class="text-muted-foreground truncate text-xs">Parent</div>
						</div>
					</div>
				{:else}
					<div class="flex justify-center">
						<div class="bg-primary/10 text-primary h-8 w-8 rounded-full">
							<Icon src={UserCircle} class="h-8 w-8" />
						</div>
					</div>
				{/if}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onSelect={() => goto('/app/settings')} class="cursor-pointer">
					<div class="shrink-0">
						<Icon src={Cog6Tooth} class="mr-2 h-4 w-4" />
					</div>
					<span>Settings</span>
				</DropdownMenu.Item>
				<DropdownMenu.Item onSelect={handleLogout} class="cursor-pointer">
					<div class="shrink-0">
						<Icon src={ArrowRightOnRectangle} class="mr-2 h-4 w-4" />
					</div>
					<span>Log out</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</aside>
