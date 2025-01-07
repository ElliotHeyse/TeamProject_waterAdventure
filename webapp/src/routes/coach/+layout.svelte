<script lang="ts">
	import '$lib/styles/app.css';
	import Sidebar from '$lib/components/coach/layout/Sidebar.svelte';
	import Header from '$lib/components/coach/layout/Header.svelte';
	import { page } from '$app/state';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
	let isSidebarOpen = $state(true);
</script>

<div class="bg-background flex min-h-screen">
	<Sidebar {isSidebarOpen} />

	<main class="flex flex-1 flex-col">
		<Header bind:isSidebarOpen />
		<div class={{ 'flex-1 p-6': page.url.pathname !== '/coach/chat' }}>
			{@render children()}
		</div>
	</main>
</div>

<Toaster />
