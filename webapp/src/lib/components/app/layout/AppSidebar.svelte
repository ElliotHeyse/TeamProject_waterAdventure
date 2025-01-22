<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/components/coach/utils';
	import { Home, User, Trophy, MessageSquare, Settings, LogOut } from 'lucide-svelte';
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
		{ href: '/app', icon: Home, label: 'Overview' },
		{ href: '/app/levels', icon: Trophy, label: 'Levels' },
		{ href: '/app/chat', icon: MessageSquare, label: 'Chat' },
		{ href: '/app/settings', icon: Settings, label: 'Settings' }
	];
</script>

<aside
	class={cn(
		'border-border bg-background/50 flex supports-[backdrop-filter]:bg-background/80 shadow-sm backdrop-blur transition-all duration-300',
		$isMobileView
			? 'border-t flex-grow-0'
			: `sticky top-0 h-screen border-r flex-col ${$isSidebarOpen ? 'w-64' : 'w-16'}`
	)}
>
	<div
		class={cn(
			'border-border flex h-16 items-center justify-between border-b px-4',
			$isMobileView ? 'hidden' : ''
		)}
	>
		{#if $isSidebarOpen}
			<img src={isDarkMode ? logoLight : logo} alt="WaterAdventure" class="h-8" />
		{:else}
			<div class="mx-auto">
				<img src={logoIcon} alt="WaterAdventure" class="h-6" />
			</div>
		{/if}
	</div>

	<nav class={cn('flex-1 space-y-1 p-2', $isMobileView ? 'flex justify-evenly' : '')}>
		{#each navItems as { href, icon: Icon, label }}
			{@const isActive =
				page.url.pathname === href || (page.url.pathname.startsWith(href) && href !== '/app')}
			<Button
				variant={isActive ? 'secondary' : 'ghost'}
				{href}
				class={cn(
					$isMobileView
						? 'mobile style mt-1'
						: `w-full justify-start ${$isSidebarOpen ? '' : 'justify-center px-2'}`
				)}
			>
				<Icon class={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
				{#if !$isMobileView && $isSidebarOpen}
					<span class="ml-2">{label}</span>
				{/if}
			</Button>
		{/each}
	</nav>

	{#if !$isMobileView}
		<div class="border-border mt-auto border-t px-3 py-3">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="w-full">
					{#if $isSidebarOpen}
						<div class="bg-muted/80 flex items-center gap-3 rounded-lg px-3 py-2.5">
							<div class="bg-primary/10 text-primary h-8 w-8 rounded-full">
								<User class="h-8 w-8" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="text-foreground truncate text-sm font-medium">{parentName}</div>
								<div class="text-muted-foreground truncate text-xs">Parent</div>
							</div>
						</div>
					{:else}
						<div class="flex justify-center">
							<div class="bg-primary/10 text-primary h-8 w-8 rounded-full">
								<User class="h-8 w-8" />
							</div>
						</div>
					{/if}
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
	{/if}
</aside>
