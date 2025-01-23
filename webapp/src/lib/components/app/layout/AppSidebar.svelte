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
		'border-border bg-background/50 flex supports-[backdrop-filter]:bg-background/80 shadow-sm backdrop-blur transition-all duration-300 z-40',
		$isMobileView
			? 'border-t flex-grow-0 pb-2'
			: `sticky top-0 h-screen border-r flex-col items-start ${$isSidebarOpen ? 'w-64' : 'w-16'}`
	)}
>
	<div class={cn("w-16 h-16 px-4 flex items-center justify-center border-border border-r",
			$isMobileView ? 'hidden' : `${$isSidebarOpen ? '' : ''}`
		)}
	>
		<!-- {#if $isSidebarOpen} -->
			<!-- <img src={isDarkMode ? logoLight : logo} alt="WaterAdventure" class="h-8" /> -->
		<!-- {:else} -->
			<div class="mx-auto">
				<!-- make dark -->
				<img src={logoIcon} alt="WaterAdventure" class="h-6" />
			</div>
	</div>

	<nav class={cn('w-full flex flex-1 border-t border-border px-1 pt-2', $isMobileView ? 'flex justify-evenly' : 'flex-col justify-start gap-2')}>
		{#each navItems as { href, icon: Icon, label }}
			{@const isActive =
				page.url.pathname === href || (page.url.pathname.startsWith(href) && href !== '/app')}
			<Button
				variant={isActive ? 'secondary' : 'ghost'}
				{href}
				class={cn("",
					$isMobileView
						? 'mt-1'
						: `w-full flex gap-4 justify-start ${$isSidebarOpen ? '' : ''}`
				)}
			>
				<Icon class={cn('h-4 w-4 ml-[3.6px]', isActive ? 'text-primary' : 'text-muted-foreground')} />
				{#if !$isMobileView && $isSidebarOpen}
					<span class="">{label}</span>
				{/if}
			</Button>
		{/each}
	</nav>

	{#if !$isMobileView}
		<div class="w-full px-1 py-1 border-t border-border">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="w-full h-16">
					{#if $isSidebarOpen}
						<div class="flex items-center justify-start w-full gap-3 py-3 pl-3 rounded-lg bg-muted/80">
							<div class="flex justify-center w-8 h-8 rounded-full bg-primary/10 text-primary align-center">
								<User class="w-8 h-8" />
							</div>
							<div class="flex flex-col items-start flex-1 min-w-0 align-start">
								<div class="text-sm font-medium truncate text-foreground">{parentName}</div>
								<div class="text-xs truncate text-muted-foreground">Parent</div>
							</div>
						</div>
					{:else}
					<div class="flex items-center justify-start w-full gap-3 py-3 pl-3 rounded-lg">
						<div class="flex justify-center w-8 h-8 rounded-full bg-primary/10 text-primary align-center">
							<User class="w-8 h-8" />
						</div>
					</div>
					{/if}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56 ml-2">
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onSelect={() => goto('/app/settings')} class="cursor-pointer">
						<Settings class="w-4 h-4 mr-2" />
						<span>Settings</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item onSelect={handleLogout} class="cursor-pointer">
						<LogOut class="w-4 h-4 mr-2" />
						<span>Log out</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
</aside>
