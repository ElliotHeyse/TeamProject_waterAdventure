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
	import logo from '$lib/img/logo-dark.svg';
	import logoIcon from '$lib/img/logo-icon.svg';

	let { isSidebarOpen } = $props<{ isSidebarOpen: boolean }>();

	const navItems = [
		{ href: '/coach', label: 'Overview', icon: ChartBar },
		{ href: '/coach/lessons', label: 'Lessons', icon: AcademicCap },
		{ href: '/coach/pupils', label: 'Pupils', icon: UserGroup },
		{ href: '/coach/submissions', label: 'Submissions', icon: ClipboardDocumentCheck },
		{ href: '/coach/chat', label: 'Chat', icon: ChatBubbleLeftRight },
		{ href: '/coach/settings', label: 'Settings', icon: Cog6Tooth }
	];
</script>

<aside
	class="border-border bg-background/50 supports-[backdrop-filter]:bg-background/80 flex h-screen flex-col border-r shadow-sm backdrop-blur transition-all duration-300"
	class:w-64={isSidebarOpen}
	class:w-16={!isSidebarOpen}
>
	<div class="border-border flex h-16 items-center justify-between border-b px-4">
		{#if isSidebarOpen}
			<img src={logo} alt="SwimCoach" class="h-8" />
		{:else}
			<div class="mx-auto">
				<img src={logoIcon} alt="SwimCoach" class="h-6" />
			</div>
		{/if}
	</div>

	<nav class="flex-1 overflow-y-auto px-2 py-3">
		<ul class="space-y-1">
			{#each navItems as { href, label, icon }}
				{@const isActive = page.url.pathname === href}
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
					<div class="text-muted-foreground truncate text-xs">Swimming Coach</div>
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
