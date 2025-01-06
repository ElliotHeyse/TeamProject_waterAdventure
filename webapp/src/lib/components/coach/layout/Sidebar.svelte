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
		ChevronLeft,
		ChevronRight
	} from 'svelte-hero-icons';
	import logo from '$lib/img/logo-dark.svg';

	let isSidebarOpen = $state(true);

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
	class="flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300"
	class:w-64={isSidebarOpen}
	class:w-16={!isSidebarOpen}
>
	<div class="flex items-center justify-between border-b border-gray-200 p-4">
		{#if isSidebarOpen}
			<img src={logo} alt="SwimCoach" class="h-8" />
		{/if}
		<button
			class="rounded-lg p-2 hover:bg-gray-100"
			onclick={() => (isSidebarOpen = !isSidebarOpen)}
		>
			<Icon src={isSidebarOpen ? ChevronLeft : ChevronRight} class="h-5 w-5 text-gray-600" />
		</button>
	</div>

	<nav class="flex-1 overflow-y-auto">
		<ul class="py-4">
			{#each navItems as { href, label, icon }}
				{@const isActive = page.url.pathname === href}
				<li>
					<a
						{href}
						class="flex items-center px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
						class:bg-blue-50={isActive}
						class:text-blue-600={isActive}
					>
						<Icon src={icon} class="h-5 w-5" />
						{#if isSidebarOpen}
							<span class="ml-3">{label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
