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
	class="flex h-screen flex-col border-r border-gray-200/50 bg-white/50 shadow-sm backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-white/80"
	class:w-64={isSidebarOpen}
	class:w-16={!isSidebarOpen}
>
	<div class="flex h-16 items-center justify-between border-b border-gray-200/50 px-4">
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
				{@const isParentActive = !isActive && page.url.pathname.startsWith(href)}
				<li>
					<a
						{href}
						class="group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
						class:bg-blue-50={isActive}
						class:text-blue-600={isActive}
						class:bg-gray-50={isParentActive}
						class:text-gray-900={isParentActive}
						class:text-gray-700={!isActive && !isParentActive}
						class:hover:bg-gray-50={!isActive}
						class:hover:text-gray-900={!isActive}
					>
						<div
							class="shrink-0 transition-colors"
							class:text-blue-600={isActive}
							class:text-gray-400={!isActive && !isParentActive}
							class:text-gray-500={isParentActive}
							class:group-hover:text-gray-600={!isActive}
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

	<div class="mt-auto border-t border-gray-200/50 px-3 py-3">
		{#if isSidebarOpen}
			<div class="flex items-center gap-3 rounded-lg bg-gray-50/80 px-3 py-2.5">
				<div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600">
					<Icon src={UserCircle} class="h-8 w-8" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="truncate text-sm font-medium text-gray-900">John Doe</div>
					<div class="truncate text-xs text-gray-500">Swimming Coach</div>
				</div>
			</div>
		{:else}
			<div class="flex justify-center">
				<div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600">
					<Icon src={UserCircle} class="h-8 w-8" />
				</div>
			</div>
		{/if}
	</div>
</aside>
