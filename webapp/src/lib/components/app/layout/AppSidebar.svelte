<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/coach/ui/button';
	import { cn } from '$lib/components/coach/utils';
	import { HomeModern, AcademicCap, ChatBubbleLeftRight, Cog6Tooth, Icon } from 'svelte-hero-icons';
	import { LogOut, Settings } from 'lucide-svelte';
	import logoIcon from '$lib/img/logo-icon.svg';
	import { isSidebarOpen } from '$lib/stores/sidebar';
	import { isMobileView } from '$lib/stores/viewport';
	import * as DropdownMenu from '$lib/components/coach/ui/dropdown-menu';
	import { goto } from '$app/navigation';
	import { getGravatarUrl } from '$lib/utils/gravatar';

	const data = $state(page.data);

	async function handleLogout() {
		await goto('/logout');
	}

	const navItems = [
		{ href: '/app', icon: HomeModern, label: 'Overview' },
		{ href: '/app/levels', icon: AcademicCap, label: 'Levels' },
		{ href: '/app/chat', icon: ChatBubbleLeftRight, label: 'Chat' },
		{ href: '/app/settings', icon: Cog6Tooth, label: 'Settings' }
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
	<div
		class={cn(
			'w-16 h-16 px-4 flex items-center justify-center border-border border-r',
			$isMobileView ? 'hidden' : `${$isSidebarOpen ? '' : ''}`
		)}
	>
		<div class="mx-auto">
			<img src={logoIcon} alt="WaterAdventure" class="h-6" />
		</div>
	</div>

	<nav
		class={cn(
			'w-full flex flex-1 border-t border-border px-1 pt-2',
			$isMobileView ? 'flex justify-evenly' : 'flex-col justify-start gap-2'
		)}
	>
		{#each navItems as { href, icon, label }}
			{@const isActive =
				page.url.pathname === href || (page.url.pathname.startsWith(href) && href !== '/app')}
			<Button
				variant={isActive ? 'secondary' : 'ghost'}
				{href}
				class={cn(
					'',
					$isMobileView ? 'mt-1' : `w-full flex gap-4 justify-start ${$isSidebarOpen ? '' : ''}`
				)}
			>
				<Icon
					src={icon}
					class={cn('h-4 w-4 ml-[3.6px]', isActive ? 'text-primary' : 'text-muted-foreground')}
				/>
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
						<div class="bg-muted/80 flex items-center gap-3 rounded-lg px-3 py-2.5">
							<div class="bg-primary/10 text-primary h-8 w-8 rounded-full overflow-hidden">
								<img
									src={getGravatarUrl(data.parentUser.email, 32)}
									alt={`${data.parentUser.name}'s profile picture`}
									class="h-full w-full object-cover"
								/>
							</div>
							<div class="min-w-0 flex-1">
								<div class="text-foreground truncate text-sm font-medium">
									{data.parentUser.name}
								</div>
								<div class="text-muted-foreground truncate text-xs">Parent</div>
							</div>
						</div>
					{:else}
						<div class="flex justify-center">
							<div class="bg-primary/10 text-primary h-8 w-8 rounded-full overflow-hidden">
								<img
									src={getGravatarUrl(data.parentUser.email, 32)}
									alt={`${data.parentUser.name}'s profile picture`}
									class="h-full w-full object-cover"
								/>
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
